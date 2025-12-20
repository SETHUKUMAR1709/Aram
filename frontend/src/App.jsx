function App() {
  const { isCheckingAuth, authUser, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-[#121212]">
        <Loader className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Layout>
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
          <Route path="/onboarding" element={<OnBoardingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <RedirectToLatestChat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lawyer"
            element={
              <ProtectedRoute>
                <LawyerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <ContactPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}
