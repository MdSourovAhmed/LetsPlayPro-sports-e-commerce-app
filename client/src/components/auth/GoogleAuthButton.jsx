import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";

export function GoogleAuthButton({ redirectTo = "/" }) {
  const loginSuccess = useAuthStore((s) => s.loginSuccess);
  const navigate = useNavigate();

  async function handleSuccess(credentialResponse) {
    try {
      // credentialResponse.credential is the Google-issued ID token (a signed JWT).
      // It must be verified server-side — the frontend never decodes/trusts it directly.
      const res = await authApi.loginWithGoogle(credentialResponse.credential);
      loginSuccess(res);

      // Merge any guest cart/wishlist into the now-authenticated session.
      const guestItems = useCartStore.getState().items;
      if (guestItems.length) useCartStore.getState().mergeItems(guestItems);
      const guestWishlist = useWishlistStore.getState().productIds;
      if (guestWishlist.length) useWishlistStore.getState().mergeIds(guestWishlist);

      toast.success(`Welcome${res.user?.name ? `, ${res.user.name}` : ""}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || "Google sign-in failed. Please try again.");
    }
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google sign-in failed. Please try again.")}
        useOneTap={false}
        theme="outline"
        shape="rectangular"
        width="100%"
      />
    </div>
  );
}
