import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import Cookie from 'js-cookie';
import { Link, withRouter } from 'react-router';
import Select from 'react-select';
import cx from 'classnames';
import {
  parseYamlInsideMarkdown,
  retriveContent,
  serializeObjtoYaml
} from '../../helpers/markdown';
import Form from './Form';
import EditorHeader from './EditorHeader';
import CaretDownIcon from '../svg/CaretDownIcon';
import ExternalLinkIcon from '../svg/ExternalLinkIcon';
import LockIcon from '../svg/LockIcon';
import TranslationIcon from '../svg/TranslationIcon';

import {
  getUrlPathByPermalinkRule,
  slugify,
  purgeObject,
  textValueIsDifferent,
  parseFilePath,
  parseNameFromFilePath,
  parseFilePathByLang
} from '../../helpers/utils';
import ConfirmDeletionModal from '../Modal/ConfirmDeletionModal';
import notify from '../common/Notify';

const repoUrl = `https://github.com/${Cookie.get('repoOwner')}/${Cookie.get(
  'repoName'
)}/`;

const fileExtMapping = ext => {
  switch (ext) {
    case 'md':
      return 'Markdown';
    case 'html':
      return 'HTML';
    default:
      return ext;
  }
};

class ContentEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentFilePath: props.params ? props.params.splat : '',
      currentFileSlug: undefined,
      currentFileExt: undefined,
      currentFileLanguage: undefined,
      isPostPublished: true,
      isDraft: false,
      language: 'cn',
      filePathInputClass: '',
      formData: {},
      currentSchema: null,
      showDeleteFileModel: false,
      disableActionBtn: false,
      fileModified: false,
      subPath: '',
      fileDate: '',
      title: '',
      shouldRenderTitle: false,
      titleTitle: 'Title',
      showFilename: false
    };
  }

  componentWillMount() {
    const { selectedCollectionFile } = this.props;

    if (selectedCollectionFile) {
      return this.getCurrentSchema(
        selectedCollectionFile.collectionType,
        this.updateEditorForm
      );
    }
  }

  componentDidMount() {
    window.addEventListener(
      'beforeunload',
      this.handleEditorUnsavedChange.bind(this)
    );
    this.props.router.setRouteLeaveHook(
      this.props.route,
      this.routerWillLeave.bind(this)
    );
  }

  componentWillReceiveProps(nextProps) {
    const { selectedCollectionFile } = nextProps;

    if (selectedCollectionFile !== this.props.selectedCollectionFile) {
      this.getCurrentSchema(
        selectedCollectionFile.collectionType,
        this.updateEditorForm
      );
    }
  }

  componentWillUnmount() {
    window.removeEventListener(
      'beforeunload',
      this.handleEditorUnsavedChange.bind(this)
    );
  }

  routerWillLeave() {
    if (this.state.fileModified) {
      return 'You have unsaved changes on this page. Do you want to leave this page and discard your changes or stay on this page?';
    }
  }

  handleEditorUnsavedChange(e) {
    if (this.state.fileModified) {
      let warning =
        'You have unsaved changes on this page. Do you want to leave this page and discard your changes or stay on this page?';
      e.returnValue = warning;
      return warning;
    }
  }

  getCurrentSchema(type, callback) {
    let { schemas } = this.props;
    schemas = schemas ? schemas : [];

    let schema = schemas.find(item => {
      return item.jekyll.id === type;
    });

    let shouldRenderTitle = false;
    let titleTitle = 'Title';
    if (
      schema.JSONSchema &&
      schema.JSONSchema.properties &&
      schema.JSONSchema.properties.title
    ) {
      if (schema.JSONSchema.properties.title.title) {
        titleTitle = schema.JSONSchema.properties.title.title;
      }
      let required = [];
      if (schema.JSONSchema.required) {
        schema.JSONSchema.required.forEach(item => {
          if (item === 'title') {
            titleTitle += '*';
          } else {
            required.push(item);
          }
        });
      }
      schema.JSONSchema.required = required;
      delete schema.JSONSchema.properties.title;
      shouldRenderTitle = true;
    }

    this.setState(
      {
        shouldRenderTitle,
        titleTitle,
        currentSchema: schema
      },
      callback
    );
  }

  setParsedFileProps(fullFilePath) {
    const { config } = this.props;
    const { currentSchema } = this.state;
    let rootFolder =
      currentSchema.jekyll.id === 'pages' ? '/' : currentSchema.jekyll.dir;
    let langs = (config && config.languages) || undefined;
    let parsedObj = parseFilePath(fullFilePath, langs, rootFolder);
    // console.log(parsedObj)
    this.setState({
      subPath: parsedObj.subPath,
      fileDate: parsedObj.fileDate,
      currentFileSlug: parsedObj.fileSlug,
      currentFileExt: parsedObj.fileExt,
      currentFileLanguage: parsedObj.lang
    });
  }

  updateEditorForm() {
    const { selectedCollectionFile, config, collections } = this.props;
    const { content, path } = selectedCollectionFile;
    const { currentSchema } = this.state;
    if (!content) return;
    let formData = {};

    // content is markdown or html
    const docConfigObj = parseYamlInsideMarkdown(content);
    if (docConfigObj && !docConfigObj['__error']) {
      const schemaObj = currentSchema.JSONSchema.properties;
      Object.keys(schemaObj).forEach(prop => {
        let valSchema = schemaObj[prop];
        let val = docConfigObj[prop];
        if (val !== undefined && valSchema.type === 'string') {
          val = String(val);
        }
        if (
          val !== undefined &&
          valSchema.type === 'array' &&
          valSchema.items.type === 'string'
        ) {
          val = val.map(item => String(item));
        }
        formData[prop] = val;
      });
      formData.published = docConfigObj.published;
      formData.draft = docConfigObj.draft;
      // formData.lang = docConfigObj.lang
      formData.body = retriveContent(content);
    } else {
      formData.body = content;
    }

    this.setState(
      {
        parsorError: docConfigObj && docConfigObj['__error'],
        title: docConfigObj && docConfigObj['title'],
        formData,
        isPostPublished:
          formData.published !== undefined ? formData.published : true,
        isDraft: formData.draft !== undefined ? formData.draft : false
        // language: formData.lang ? formData.lang : 'cn'
      },
      () => {
        this.setParsedFileProps(path);
      }
    );

    let rootFolder =
      currentSchema.jekyll.id === 'pages' ? '/' : currentSchema.jekyll.dir;
    this.getTranslation(
      selectedCollectionFile,
      collections,
      config,
      rootFolder
    );
  }

  onFormSubmit = ({ formData: data }) => {
    const formData = Object.assign({}, data);
    const {
      selectedCollectionFile,
      selectCollectionFile,
      currentBranch,
      updateFile,
      deleteFile,
      replaceFile,
      collectionFileRemoved,
      collectionFileUpdated,
      toRoute,
      params: { repoOwner, repoName, collectionType, branch, splat }
    } = this.props;
    const {
      currentSchema,
      isPostPublished,
      isDraft,
      language,
      currentFileLanguage,
      title
    } = this.state;
    const filePath = this.state.currentFilePath;

    let reqPromise = null;

    if (!this.state.currentFileSlug) {
      console.error('no file name specified');
      this.setState({ filePathInputClass: 'error' });
      return;
    }
    let updatedContent = formData.body;
    delete formData.body;

    if (isPostPublished === false) {
      formData.published = false;
    } else {
      delete formData.published;
    }
    if (isDraft === true) {
      formData.draft = true;
    } else {
      delete formData.draft;
    }
    if (currentFileLanguage) {
      formData.lang = currentFileLanguage;
    }
    if (title !== '') {
      formData.title = title;
    }
    // delete all undefined property
    purgeObject(formData);

    this.setState({ disableActionBtn: true, formData: data });

    if (filePath !== selectedCollectionFile.path) {
      // file path changed
      let oldPath = selectedCollectionFile.path;
      updatedContent =
        this.updateFileFrontMatter(selectedCollectionFile.content, formData) +
        updatedContent;

      reqPromise = replaceFile(
        currentBranch,
        oldPath,
        filePath,
        updatedContent
      ).then(data => {
        let newItem = {
          path: filePath,
          content: updatedContent,
          collectionType: collectionType,
          lastUpdatedAt: data.commit.committer.date,
          lastUpdatedBy: data.commit.committer.name,
          lastCommitSha: data.commit.sha
        };
        collectionFileUpdated(oldPath, newItem);
        selectCollectionFile(newItem);
        toRoute(
          `/${repoOwner}/${repoName}/${collectionType}/${branch}/${filePath}`
        );
        this.setState({ disableActionBtn: false, fileModified: false });
      });
    } else {
      updatedContent =
        this.updateFileFrontMatter(selectedCollectionFile.content, formData) +
        updatedContent;

      if (
        !textValueIsDifferent(selectedCollectionFile.content, updatedContent)
      ) {
        this.setState({ disableActionBtn: false, fileModified: false });
        return notify('warning', "You don't have any changes!");
      }
      reqPromise = updateFile(
        currentBranch,
        filePath,
        updatedContent
      ).then(data => {
        let newItem = {
          path: filePath,
          content: updatedContent,
          collectionType: collectionType,
          lastUpdatedAt: data.commit.committer.date,
          lastUpdatedBy: data.commit.committer.name,
          lastCommitSha: data.commit.sha
        };
        collectionFileUpdated(filePath, newItem);
        selectCollectionFile(newItem);
        this.setState({ disableActionBtn: false, fileModified: false });
      });
    }

    reqPromise
      .then(() => {
        notify('success', 'Change saved!');
      })
      .catch(err => {
        this.setState({ disableActionBtn: false });
        notify('error', 'Unable to complete the operation!');
      });
  };

  updateFileFrontMatter(originalFile, editorFormData) {
    let originalDocHeaderObj = parseYamlInsideMarkdown(originalFile) || {};

    Object.keys(editorFormData).forEach(prop => {
      originalDocHeaderObj[prop] = editorFormData[prop];
    });
    return serializeObjtoYaml(originalDocHeaderObj);
  }

  handleSaveBtn() {
    let clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    let $formBtn = this.refs.form.refs.formSubmitBtn;
    ReactDOM.findDOMNode($formBtn).dispatchEvent(clickEvt);
  }

  handleDeleteFile() {
    const {
      currentBranch,
      selectedCollectionFile,
      deleteFile,
      collectionFileRemoved,
      toRoute,
      params: { repoOwner, repoName, splat }
    } = this.props;

    if (splat === 'new') {
      return this.closeDeleteFileModel();
    }
    this.closeDeleteFileModel();
    this.setState({ disableActionBtn: true });
    deleteFile(currentBranch, selectedCollectionFile.path)
      .then(() => {
        collectionFileRemoved(selectedCollectionFile.path);
        toRoute(`/${repoOwner}/${repoName}`);
        notify('success', 'File deleted!');
      })
      .catch(err => {
        this.setState({ disableActionBtn: false });
        notify('error', 'Unable to complete the operation!');
      });
  }

  handlePublishInput(evt) {
    const { isPostPublished } = this.state;
    this.setState({
      isPostPublished: !isPostPublished,
      fileModified: true
    });
  }

  handleDraftInput(evt) {
    const { isDraft } = this.state;
    this.setState({
      isDraft: !isDraft,
      fileModified: true
    });
  }

  closeDeleteFileModel() {
    this.setState({ showDeleteFileModel: false });
  }

  handleFileSlugInput = evt => {
    this.setState({ currentFileSlug: evt.target.value }, () => {
      this.updateCurrentFilePath();
    });
  };

  handleSlugSelect(selected) {
    this.setState({ currentFileExt: selected.value }, () => {
      this.updateCurrentFilePath();
    });
  }

  getTranslation(selectedCollectionFile, collections, config, rootFolder) {
    if (!config || !config.languages) {
      return;
    }

    let fileName = parseNameFromFilePath(selectedCollectionFile.path);
    let availableLanguages = config.languages;

    let translations = collections.filter(col => {
      return (
        col.path.indexOf(fileName) > -1 &&
        col.path !== selectedCollectionFile.path &&
        col.collectionType === selectedCollectionFile.collectionType
      );
    });

    translations = translations.map(c => {
      let code = parseFilePathByLang(c.path, config.languages, rootFolder);
      let matchedLang = config.languages.find(l => {
        return l.code === code;
      });
      return { filePath: c.path, language: matchedLang.name, code };
    });

    translations.forEach(t => {
      availableLanguages = availableLanguages.filter(l => {
        return l.code !== t.code;
      });
    });

    this.setState({
      availableLanguages,
      translations
    });
  }

  isDefaultLanguage = () => {
    const { config } = this.props;
    const { currentFileLanguage } = this.state;
    if (
      config &&
      config.languages &&
      currentFileLanguage !== config.languages[0].code
    ) {
      return false;
    }
    return true;
  };

  handleTitleOnChange = evt => {
    // slug is like "2017-05-25-hello-world"
    // no directory name and extension

    // note this method is different from the one on NewEditor
    // we won't update filepath while changing title
    const val = evt.target.value;
    this.setState({
      title: val,
      fileModified: true
    });
  };

  handleShowFilename = evt => {
    evt.preventDefault();
    this.setState({
      showFilename: true
    });
  };

  handleHideFilename = evt => {
    evt.preventDefault();
    this.setState({
      showFilename: false
    });
  };

  updateCurrentFilePath() {
    const { config } = this.props;
    const {
      currentFileSlug,
      currentFileExt,
      currentFileLanguage,
      currentSchema,
      subPath
    } = this.state;
    let newPathArray = [];
    let newFilename = currentFileExt
      ? currentFileSlug + '.' + currentFileExt
      : currentFileSlug;
    if (currentSchema.jekyll.id !== 'pages') {
      newPathArray.push(currentSchema.jekyll.dir);
    }
    if (false === this.isDefaultLanguage()) {
      newPathArray.push(currentFileLanguage);
    }
    if (subPath !== '') {
      newPathArray.push(subPath);
    }
    newPathArray.push(newFilename);
    this.setState({
      currentFilePath: newPathArray.join('/'),
      fileModified: true
    });
  }

  toContentListing() {
    const { toRoute, repoFullName, currentBranch } = this.props;
    toRoute(`/${repoFullName}/?branch=${currentBranch}`);
  }

  renderTitle = () => {
    const {
      shouldRenderTitle,
      currentFileSlug,
      currentFilePath,
      showFilename,
      titleTitle,
      title,
      fileDate
    } = this.state;
    if (shouldRenderTitle === false) return null;
    return (
      <div>
        <div className="field title">
          <label>
            {titleTitle}
          </label>
          <input
            type="text"
            value={title}
            onChange={this.handleTitleOnChange}
          />
          {showFilename === false
            ? <small className="description">
                <strong>File path: </strong>
                {currentFilePath}
                {'  '}
                {!this.props.config.file_path_readonly &&
                  <a href="javascript:;" onClick={this.handleShowFilename}>
                    ( edit )
                  </a>}
              </small>
            : null}
        </div>
        {showFilename === true
          ? <div className="field filename">
              <label>
                Filename{'  '}(<a
                  href="javascript:;"
                  onClick={this.handleHideFilename}
                >
                  hide
                </a>)
              </label>
              <input
                type="text"
                value={currentFileSlug}
                onChange={this.handleFileSlugInput}
              />
              <small className="description">
                <strong>File path: </strong>
                {currentFilePath}
              </small>
            </div>
          : null}
      </div>
    );
  };

  onFormChange = res => {
    this.setState({ formData: res.formData, fileModified: true });
  };

  getBuildSitePath() {
    const { selectedCollectionFile, config } = this.props;
    const { formData, currentFileLanguage } = this.state;
    let collectionType = selectedCollectionFile.collectionType;
    let filepath = selectedCollectionFile.path;
    let permalinkConfig = config.collections_permalink;
    let path = null;

    if (!permalinkConfig || !permalinkConfig[collectionType]) {
      return path;
    }
    path = getUrlPathByPermalinkRule(
      filepath,
      formData,
      permalinkConfig[collectionType]
    );
    if (
      !currentFileLanguage ||
      (currentFileLanguage && this.isDefaultLanguage())
    ) {
      return path;
    }
    return currentFileLanguage + '/' + path;
  }

  renderBuildSiteUrl = () => {
    const { config, buildSiteUrl } = this.props;
    let sitePath = this.getBuildSitePath() || '';
    let siteUrl = buildSiteUrl + '/' + sitePath;
    if (!config.displayBuildUrl || !buildSiteUrl) {
      return null;
    }
    return (
      <small className="meta">
        Content in this file may appearing on
        <a href={siteUrl} target="_blank">
          {' '}{siteUrl}
        </a>
      </small>
    );
  };

  render() {
    const {
      editorUpdating,
      selectedCollectionFile,
      params,
      schemas,
      config,
      repoFullName,
      currentBranch
    } = this.props;
    const {
      filePathInputClass,
      formData,
      currentFilePath,
      availableLanguages,
      translations,
      currentSchema,
      disableActionBtn,
      currentFileSlug,
      fileModified,
      parsorError
    } = this.state;

    let needTranslation =
      availableLanguages &&
      availableLanguages.filter(lang => {
        return lang.code !== this.state.currentFileLanguage;
      });

    let btnBundleClassName = cx('bundle', { disabled: disableActionBtn });
    let saveBtnClassName = cx('button save', {
      disabled: !fileModified || disableActionBtn,
      primary: fileModified && !disableActionBtn,
      processing: fileModified && disableActionBtn
    });
    let menuBtnClassName = cx('button icon', { primary: fileModified });

    if (!currentSchema) return <section id="content" />;

    return (
      <section id="content" className="editor">
        <EditorHeader
          btnBundleClassName={btnBundleClassName}
          saveBtnClassName={saveBtnClassName}
          handleSaveBtn={::this.handleSaveBtn}
          menuBtnClassName={menuBtnClassName}
          publishBtnClassName={
            this.state.isPostPublished ? 'selected' : 'disabled'
          }
          handlePublishInput={::this.handlePublishInput}
          draftBtnClassName={this.state.isDraft ? 'selected' : 'disabled'}
          handleDraftInput={::this.handleDraftInput}
          handleDeleteBtn={evt => {
            this.setState({ showDeleteFileModel: true });
          }}
          handleBackBtn={::this.toContentListing}
        />
        <ConfirmDeletionModal
          isOpen={this.state.showDeleteFileModel}
          onclose={::this.closeDeleteFileModel}
          onsubmit={::this.handleDeleteFile}
          oncancel={::this.closeDeleteFileModel}
        />

        <div className="body">
          <div className="meta">
            <small>
              <strong>{selectedCollectionFile.collectionType}</strong>&nbsp;
              <a
                className="edit tooltip-bottom"
                href={`${repoUrl}commit/${selectedCollectionFile.lastCommitSha}`}
                target="_blank"
              >
                Updated&nbsp;
                {moment(
                  Date.parse(selectedCollectionFile.lastUpdatedAt)
                ).fromNow()}&nbsp; by&nbsp;
                {selectedCollectionFile.lastUpdatedBy}
                <span>View on GitHub</span>
              </a>
            </small>
            {this.renderBuildSiteUrl()}
          </div>

          {parsorError &&
            <div className="error-msg-block">
              Unable to parse fields properly as {parsorError}
            </div>}
          {config &&
            config.languages &&
            <div className="field language">
              <label>Language</label>
              <span className="bundle">
                <span className="menu">
                  <button className="button active locked">
                    {availableLanguages &&
                      availableLanguages
                        .filter(lang => {
                          return lang.code === this.state.currentFileLanguage;
                        })
                        .map(language => {
                          return (
                            <span key={language.code}>
                              {language.name}&nbsp;
                            </span>
                          );
                        })}
                    <LockIcon />
                  </button>
                </span>
                <span className="menu">
                  <button className="button icon">
                    <TranslationIcon />
                  </button>
                  <div className="options">
                    {(needTranslation &&
                      needTranslation.length &&
                      <h2>Translate to</h2>) ||
                      ''}
                    {needTranslation &&
                      needTranslation.map(lang => {
                        return (
                          <Link
                            key={lang.code}
                            to={`/${repoFullName}/${params.collectionType}/${currentBranch}/new?baseFile=${params.splat}&language=${lang.code}&branch=${currentBranch}`}
                            target="_blank"
                          >
                            <TranslationIcon />
                            {lang.name}
                          </Link>
                        );
                      })}
                    {(needTranslation &&
                      needTranslation.length &&
                      translations &&
                      translations.length &&
                      <hr />) ||
                      ''}
                    {(translations &&
                      translations.length &&
                      <h2>Existing translations</h2>) ||
                      ''}
                    {translations &&
                      translations.map(t => {
                        return (
                          <Link
                            to={`/${repoFullName}/${params.collectionType}/${currentBranch}/${t.filePath}`}
                            key={t.code}
                            target="_blank"
                          >
                            <ExternalLinkIcon />
                            {t.language}
                          </Link>
                        );
                      })}
                  </div>
                </span>
              </span>
            </div>}

          {this.renderTitle()}

          <Form
            ref="form"
            onFormChange={::this.onFormChange}
            onFormSubmit={::this.onFormSubmit}
            schema={currentSchema.JSONSchema}
            uiSchema={currentSchema.uiSchema}
            formData={formData}
          />
        </div>
      </section>
    );
  }
}

export default withRouter(ContentEditor);
