import re

with open("src/pages/Login.tsx", "r") as f:
    content = f.read()

state_vars = """
  // Forgot Password State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code, 3: New Pass, 4: Success
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setForgotStep(2);
    }, 1500);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setForgotStep(3);
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setForgotStep(4);
    }, 1500);
  };
"""

if "forgotModalOpen" not in content:
    content = content.replace("const [loading, setLoading] = useState(false);", "const [loading, setLoading] = useState(false);\n" + state_vars)

forgot_password_link = """<button type="button" onClick={() => {setForgotModalOpen(true); setForgotStep(1); setResetEmail(''); setResetCode(''); setNewPass('');}} className="text-xs font-medium text-brand-600 hover:text-brand-500">
                      Forgot password?
                    </button>"""

if "Forgot password?</button>" not in content:
    content = content.replace(
        """<a href="#" className="text-xs font-medium text-brand-600 hover:text-brand-500">
                      Forgot password?
                    </a>""",
        forgot_password_link
    )

modal_html = """
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-sm border-0 shadow-2xl animate-in zoom-in-95">
            <CardContent className="p-6">
              {forgotStep === 1 && (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                      <Lock size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
                    <p className="text-sm text-slate-500">Enter your email or ID to receive a code.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Email or ID</Label>
                    <Input required value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="e.g. johndoe@school.edu.ng" />
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setForgotModalOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={resetLoading}>
                      {resetLoading ? "Sending..." : "Send Code"}
                    </Button>
                  </div>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                      <Shield size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Enter Verification Code</h3>
                    <p className="text-sm text-slate-500">We sent a 6-digit code to your email.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <Input required value={resetCode} onChange={e => setResetCode(e.target.value)} placeholder="123456" className="text-center tracking-widest text-lg font-bold" maxLength={6} />
                    <p className="text-xs text-center text-slate-500 mt-2">Use <span className="font-bold text-slate-700">123456</span> for demo.</p>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setForgotStep(1)}>Back</Button>
                    <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={resetLoading || resetCode.length < 4}>
                      {resetLoading ? "Verifying..." : "Verify Code"}
                    </Button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                      <Lock size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Create New Password</h3>
                    <p className="text-sm text-slate-500">Enter a new secure password.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input required type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="pt-2">
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={resetLoading || newPass.length < 6}>
                      {resetLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </form>
              )}

              {forgotStep === 4 && (
                <div className="text-center space-y-4 py-4">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Password Reset!</h3>
                  <p className="text-sm text-slate-500">Your password has been successfully reset. You can now login.</p>
                  <Button className="w-full mt-4" variant="brand" onClick={() => setForgotModalOpen(false)}>
                    Back to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
"""

if "forgotModalOpen && (" not in content:
    content = content.replace("return (", "return (\n    <>\n" + modal_html)
    content = content.replace("  );\n}", "  );\n}\n")
    # Need to properly wrap return (<div className="min-h-screen...>...</div>) in fragments
    content = content.replace("return (\n    <>\n", "return (\n    <>\n      ")
    content = content.replace("    </div>\n  );\n}", "    </div>\n    </>\n  );\n}")

with open("src/pages/Login.tsx", "w") as f:
    f.write(content)
