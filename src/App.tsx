import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { AppLayout } from './components/layout';
import { Landing, Dashboard, CaseList, CaseDetail, CaseForm, Library, PrivacyPolicy, TermsOfService, PDPACompliance } from './pages';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/pdpa" element={<PDPACompliance />} />

          {/* Protected routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cases" element={<CaseList />} />
            <Route path="/cases/new" element={<CaseForm />} />
            <Route path="/cases/:id/edit" element={<CaseForm />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/library" element={<Library />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

