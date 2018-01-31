/* override react-modal default style */
const ModalCustomStyle = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },
  content: {
    position: 'relative',
    border: '1px solid #ccc',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '2px',
    outline: 'none',
    padding: 0,
    width: '50%'
  }
}

export default ModalCustomStyle
