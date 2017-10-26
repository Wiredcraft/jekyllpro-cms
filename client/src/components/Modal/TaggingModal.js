import React, { Component } from 'react';
import Modal from 'react-modal';
import ModalCustomStyle from '../Modal';
import ModalCloseIcon from '../svg/ModalCloseIcon';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { listAllTags, createTag } from '../../helpers/api';

@connect(mapStateToProps, null)
export default class TaggingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      newTag: '',
      tags: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOpen && nextProps.isOpen !== this.props.isOpen) {
      this.setState({ loading: true });

      listAllTags().then(data => {
        console.log(data);
        this.setState({ tags: data, loading: false });
      });
    }
  }

  handleInput(e) {
    let val = e.target.value;
    let { tags } = this.state;
    let notDuplicate = tags.reduce((prev, item) => {
      return prev && item.name !== val;
    }, true);
    this.setState({
      newTag: val,
      duplicate: !notDuplicate,
      invalidated: /[^\w\d.-]/g.test(val)
    });
  }

  handleCreate() {
    const { currentBranch } = this.props;
    const { newTag, duplicate, invalidated, tags } = this.state;
    if (duplicate || invalidated) {
      return;
    }
    this.setState({ loading: true });
    createTag(currentBranch, newTag).then(data => {
      let savedTag = {
        name: data.ref.replace('refs/tags/', ''),
        commit: data.object
      };
      tags.splice(0, 0, savedTag);
      this.setState({
        loading: false,
        newTag: '',
        tags: [...tags]
      });
    });
  }

  render() {
    const { isOpen, onclose } = this.props;

    return (
      <Modal
        contentLabel="Tag manager"
        className="tag-manager"
        style={ModalCustomStyle}
        isOpen={isOpen}
        onRequestClose={onclose}
      >
        <header className="header">
          <a className="close" id="close-modal" onClick={onclose}>
            <ModalCloseIcon />
          </a>
          <h2>Create a new tag in github</h2>
        </header>
        <section className={this.state.loading ? 'body loading' : 'body'}>
          <div className="create-new">
            <div className="field">
              <input
                type="text"
                onChange={::this.handleInput}
                placeholder="Tag name"
              />
              <button
                type="button"
                onClick={::this.handleCreate}
                className="button primary"
              >
                Create
              </button>
            </div>
            {this.state.invalidated &&
              <p>
                Please use number, letters, dot, or dash. i.e. v1.0.7-some-test
              </p>}
            {this.state.duplicate && <p>Duplicate tag name is not allowed</p>}
          </div>
          <ul className="tag-list">
            {this.state.tags.map(tagItem => {
              let githubUrl = tagItem.commit.url.replace(
                'api.github.com/repos',
                'github.com'
              );
              return (
                <li key={tagItem.name}>
                  <a href={githubUrl} target="_blank">
                    {tagItem.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  var repoState = state.repo.toJSON();
  return {
    currentBranch: repoState.currentBranch
  };
}
