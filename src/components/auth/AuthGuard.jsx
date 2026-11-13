import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../ui/Spinner";

export default function AuthGuard({ children, requireWriter = false }) {
  const { user, profile, loading, isWriter } = useAuth();
  if (loading) return <div className="py-20"><Spinner /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (requireWriter && !isWriter) return <Navigate to="/" replace />;
  return children;
}