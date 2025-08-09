export default function Loading({ message = "Please wait..." }) {
  return (
    <div className="spinner-overlay">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className="spinner"></div>
        <div className="spinner-message">{message}</div>
      </div>
    </div>
  );
}
