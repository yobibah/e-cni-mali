

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">


      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-xs"
        onClick={onClose}
      />

  
      <div className="relative w-full max-w-5xl mx-3">
        {children}
      </div>

    </div>
  );
};

export default Modal;