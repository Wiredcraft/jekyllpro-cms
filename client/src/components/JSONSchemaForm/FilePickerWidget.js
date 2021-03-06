import React, { Component } from 'react';
import FilePickerIcon from '../svg/FilePickerIcon';
import FileManagerModal from '../Modal/FileManagerModal';

export default class FilePickerWidget extends Component {
  constructor(props) {
    super(props);
    this.state = { modalIsOpen: false };
  }

  handleChange(selected) {
    const { onChange } = this.props;
  }

  handleClick() {
    this.setState({ modalIsOpen: true });
  }

  onModalClose() {
    this.setState({ modalIsOpen: false });
  }

  handleModalSelect(filePath) {
    this.props.onChange(filePath);
  }

  render() {
    const {
      schema,
      id,
      options,
      value,
      required,
      disabled,
      readonly,
      multiple,
      autofocus,
      onChange
    } = this.props;

    const { modalIsOpen } = this.state;

    return (
      <div>
        <span className="file-picker" id={id}>
          <input
            type="text"
            onChange={evt => onChange(evt.target.value)}
            value={value}
            required={required}
            placeholder="File"
          />
          <button
            type="button"
            onClick={::this.handleClick}
            className="button icon"
          >
            <FilePickerIcon />
          </button>
        </span>
        <FileManagerModal
          handleSelect={::this.handleModalSelect}
          onclose={::this.onModalClose}
          isOpen={modalIsOpen}
        />
      </div>
    );
  }
}
