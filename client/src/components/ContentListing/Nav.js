import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';
import moment from 'moment';

import NestedFileTreeView from 'components/common/NestedFileTree';
import { setNavPath } from 'actions/navActions';

function parseNavMenu(navMenuArray) {
  let directory = { _contents: [] };

  let leafNodes = navMenuArray.filter(item => {
    return item.creatable;
  });
  let treeNodes = navMenuArray.filter(item => {
    return !item.creatable;
  });
  treeNodes.forEach(item => {
    let idStr = item.id.split('_');
    var p = directory;
    idStr.forEach(s => {
      if (!p[s]) {
        p[s] = { _meta: item, _contents: [] };
      }
      p = p[s];
    });
  });
  leafNodes.forEach(item => {
    let idStr = item.id.split('_');
    let len = idStr.length;
    let nodePath = idStr.join('/');
    var n = directory;

    idStr.forEach((f, idx) => {
      if (idx === len - 1) {
        n._contents.push({
          name: idStr[len - 1],
          path: nodePath,
          _meta: item
        });
      } else {
        n = n[f];
      }
    });
  });

  return directory;
}

function CustomFolder(props) {
  return (
    <a onClick={props.onclick}>
      <span className="name">
        {props.folderObj._meta.label}
      </span>
    </a>
  );
}

function CustomFile(props) {
  return (
    <a>
      <span className="name">
        {props._meta.label}
      </span>
    </a>
  );
}

class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filtering: false,
      selectedMenuId: props.menuPath || ''
    };
  }

  handleTreeNodeClick(name, currentPath, folderObj) {
    let meta = folderObj._meta;
    this.props.setNavPath(meta.id, meta);
    this.setState({ selectedMenuId: meta.id });
  }

  handleLeafNodeClick(fileObj) {
    console.log(fileObj);
    let meta = fileObj._meta;
    this.props.setNavPath(meta.id, meta);
    this.setState({ selectedMenuId: meta.id });
  }

  render() {
    const { selectedMenuId } = this.state;
    let selectedMenuPath = selectedMenuId.split('_').join('/');
    let menuObj = parseNavMenu(this.props.menu);

    return (
      <nav className="nav-filter">
        <NestedFileTreeView
          expended
          selectedFilePath={selectedMenuPath}
          fileTemplate={CustomFile}
          folderTemplate={CustomFolder}
          fileClickHandler={::this.handleLeafNodeClick}
          folderClickHandler={::this.handleTreeNodeClick}
          directory={menuObj}
        />
      </nav>
    );
  }
}

function mapStateToProps(state) {
  var navState = state.nav.toJSON();
  return {
    menuPath: navState.menuPath,
    menuMeta: navState.menuMeta
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setNavPath
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Nav);
