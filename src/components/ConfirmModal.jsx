import './ConfirmModal.css';

const ConfirmModal = ({ message, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
/*Without:
  e.stopPropagation()

a click inside the modal would bubble up to the parent: 

clicking anywhere inside the modal—even empty space, message,
 etc.—won't accidentally close it. You need to click the actual Cancel button to call onCancel.


 This is called Event Propagation, specifically Event Bubbling.

In simple interview language:

Event bubbling means an event starts from the clicked child element and propagates upward to its parent elements. 
stopPropagation() stops that event from bubbling to the parent.
*/