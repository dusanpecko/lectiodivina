import { useRouter } from "next/router";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { code, type, email } = router.query;
      if (type === "recovery" && code && email) {
        const supabase = createClientComponentClient();
        const { error } = await supabase.auth.verifyOtp({
          type: "recovery",
          token: code as string,
          email: email as string,
        });
        if (error) {
          router.replace("/reset-password?error=invalid");
        } else {
          router.replace("/reset-password");
        }
      }
    };
    handleAuth();
  }, [router]);

  return <div>Overujeme váš link...</div>;
}