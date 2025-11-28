import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCoachStats } from '@/data/mockData';
import { 
  Users, DollarSign, BookOpen, Star, Plus, Calendar, MessageCircle, BarChart3, 
  Loader2, ChevronDown, ArrowRight, CheckCircle, TrendingUp, 
  Award, Home, FileText, GraduationCap, Settings, HelpCircle, LogOut, 
  Clock, User, CreditCard, AlertTriangle, Play, Edit, Eye, 
  Activity, Upload, Save, Camera, EyeOff, Trash2, MoreVertical, RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  checkInstructorApprovalStatus, 
  getCoachProfile, 
  updateCoachProfile,
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorEnrollments,
  getCourseEnrollments,
  getStudentEnrollmentDetails,
  getEnrollmentStatistics,
  getCourseEnrollmentCount
} from '@/ApiConfig/CoachConnection';
import {
  createModule,
  getCourseModules,
  updateModule,
  deleteModule,
  createAssignment,
  getModuleAssignments,
  updateAssignment,
  deleteAssignment,
  createResource,
  getModuleResources,
  updateResource,
  deleteResource,
  getAssignmentSubmissions,
  getCourseSubmissions,
  getSubmissionStatistics,
  gradeSubmission,
  getCourseGrades,
  getStudentGrades,
  getGradeStatistics
} from '@/ApiConfig/InstructorServices';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const CoachDashboard = () => {
export const test = 'test';
};

export default CoachDashboard;