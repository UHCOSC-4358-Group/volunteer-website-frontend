import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UserContext";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    const redirectPath =
      user?.role === "admin" ? "/admin/dashboard" : "volunteer/dashboard";
    navigate(redirectPath);
  };

  return (
    <div className="flex justify-center items-center w-[100vw] h-[100vh] font-medium">
      <div className="bg-navy text-white rounded-2xl p-5 flex flex-col gap-5">
        <h1 className="font-extrabold">Access Denied.</h1>
        <p>You don't have permission to access this page.</p>
        <button
          onClick={handleGoBack}
          className="p-1.5 bg-mint font-normal rounded-full cursor-pointer self-end text-black"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};
