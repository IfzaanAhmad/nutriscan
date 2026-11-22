import { Link } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

// Catch-all route for any URL that doesn't match.
export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <StatusMessage
      headingLevel={1}
      type="error"
      title="Page not found"
      message="That page doesn't exist."
      action={
        <Link to="/" className="btn btn-primary">
          Back to search
        </Link>
      }
    />
  );
}
