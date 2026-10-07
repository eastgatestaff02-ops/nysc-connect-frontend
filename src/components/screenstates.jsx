export const LoadingState = ({ label = 'Loading…' }) => (
  <div className="state loading"><span className="spinner" /> {label}</div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="state error">
    <p>{message}</p>
    {onRetry && <button onClick={onRetry}>Retry</button>}
  </div>
);

export const EmptyState = ({ message }) => (
  <div className="state empty">{message}</div>
);

export const OfflineBanner = () => (
  <div className="offline-banner">You are offline — showing cached data.</div>
);