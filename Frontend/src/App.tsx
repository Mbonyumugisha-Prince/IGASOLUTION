import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import StudentLogin from "./pages/student/StudentLogin";
import StudentSignup from "./pages/student/StudentSignup";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import MyCourses from "./pages/student/MyCourses";
import MyAssignments from "./pages/student/MyAssignments";
import MyGrades from "./pages/student/MyGrades";
import MyPayments from "./pages/student/MyPayments";
import CourseLearning from "./pages/student/CourseLearning";
import SystemSettings from "./pages/settings/SystemSettings";
import HelpCenter from "./pages/help/HelpCenter";
import CoachRegister from "./pages/coach/CoachRegister";
import CoachLogin from "./pages/coach/CoachLogin";
import CoachDashboard from "./pages/coach/CoachDashboard";
import BrowseCourses from "./pages/BrowseCourses";
import CourseDetail from "./pages/CourseDetail";
import PaymentHistory from "./pages/PaymentHistory";
import PaymentCallback from "./pages/PaymentCallback";
import BackendCallbackRedirect from "./pages/BackendCallbackRedirect";
import UniversalPaymentCallback from "./pages/UniversalPaymentCallback";
import PaymentTestPage from "./pages/PaymentTestPage";
import StudentAssignments from "./pages/student/StudentAssignments";
import CoachEarnings from "./pages/coach/CoachEarnings";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashBoard";

const queryClient = new QueryClient();

import { ThemeProvider } from "@/components/theme-provider";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/courses" element={<BrowseCourses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            
            {/* Student Routes */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/signup" element={<StudentSignup />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/my-courses" element={<MyCourses />} />
            <Route path="/student/course/:courseId/learn" element={<CourseLearning />} />
            <Route path="/student/course/:courseId/assignments" element={<StudentAssignments />} />
            <Route path="/student/my-assignments" element={<MyAssignments />} />
            <Route path="/student/my-grades" element={<MyGrades />} />
            <Route path="/student/my-payments" element={<MyPayments />} />
            <Route path="/student/payments" element={<PaymentHistory />} />
            <Route path="/payment/callback" element={<UniversalPaymentCallback />} />
            <Route path="/api/public/payments/callback" element={<UniversalPaymentCallback />} />
            <Route path="/callback" element={<UniversalPaymentCallback />} />
            <Route path="/payment/test" element={<PaymentTestPage />} />
            <Route path="/settings" element={<SystemSettings />} />
            <Route path="/help" element={<HelpCenter />} />
          
          {/* Coach Routes */}
          <Route path="/coach" element={<Navigate to="/coach/login" replace />} />
          <Route path="/coach/register" element={<CoachRegister />} />
          <Route path="/coach/login" element={<CoachLogin />} />
          <Route path="/coach/dashboard" element={<CoachDashboard />} />
          <Route path="/coach/earnings" element={<CoachEarnings />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
