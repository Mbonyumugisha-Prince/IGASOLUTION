import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  Link as LinkIcon, 
  Download,
  CheckCircle,
  BookOpen,
  ChevronRight,
  ChevronDown,
  User
} from 'lucide-react';
import {
  fetchCourseContent,
  fetchStudentProfile,
  ModuleDto,
  ResourceDto
} from '@/ApiConfig/StudentConnection';

const CourseLearning: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleDto | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceDto | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const resp = await fetchStudentProfile();
        if (resp && resp.success && resp.data) {
          setProfile(resp.data);
        }
      } catch (e) {
        console.warn('Could not load profile', e);
      }
    };

    const loadCourseContent = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Check authentication first
        const token = localStorage.getItem('authtoken');
        if (!token) {
          console.log('No authentication token found, redirecting to login');
          navigate(`/student/login?redirect=${encodeURIComponent(`/student/course/${courseId}/learn`)}`);
          return;
        }
        
        console.log('Starting course content fetch for courseId:', courseId);
        console.log('Using token (first 20 chars):', token.substring(0, 20) + '...');
        
        const courseModules = await fetchCourseContent(courseId);
        setModules(courseModules);
        
        // Auto-select first module and first resource
        if (courseModules.length > 0) {
          const firstModule = courseModules[0];
          setSelectedModule(firstModule);
          setExpandedModules(new Set([firstModule.id]));
          
          if (firstModule.resources && firstModule.resources.length > 0) {
            setSelectedResource(firstModule.resources[0]);
          }
        }
        
      } catch (err: any) {
        console.error('Error loading course content:', err);
        
        // Handle authentication errors specifically
        if (err.message && err.message.includes('Authentication failed')) {
          console.log('Authentication failed, redirecting to login');
          navigate(`/student/login?redirect=${encodeURIComponent(`/student/course/${courseId}/learn`)}`);
          return;
        }
        
        setError(err.message || 'Failed to load course content');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    loadCourseContent();
  }, [courseId]);

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const selectResource = (module: ModuleDto, resource: ResourceDto) => {
    setSelectedModule(module);
    setSelectedResource(resource);
    // Ensure module is expanded when resource is selected
    setExpandedModules(prev => new Set([...prev, module.id]));
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Play className="h-4 w-4" />;
      case 'PDF': 
      case 'DOCUMENT': return <FileText className="h-4 w-4" />;
      case 'LINK': return <LinkIcon className="h-4 w-4" />;
      case 'SLIDE': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getResourceTypeBadge = (type: string) => {
    const colors = {
      'VIDEO': 'bg-red-100 text-red-800',
      'PDF': 'bg-blue-100 text-blue-800',
      'DOCUMENT': 'bg-green-100 text-green-800',
      'LINK': 'bg-purple-100 text-purple-800',
      'SLIDE': 'bg-orange-100 text-orange-800'
    };
    
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderResourceContent = () => {
    if (!selectedResource) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Select a resource to start learning</h3>
            <p className="text-sm">Choose a video, document, or link from the module list on the left</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Resource Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getResourceIcon(selectedResource.resourceType)}
            <div>
              <h2 className="text-2xl font-bold">{selectedResource.title}</h2>
              <p className="text-gray-600">Module: {selectedModule?.title}</p>
            </div>
          </div>
          <Badge className={getResourceTypeBadge(selectedResource.resourceType)}>
            {selectedResource.resourceType}
          </Badge>
        </div>

        {/* Resource Description */}
        {selectedResource.description && (
          <Card>
            <CardContent className="p-4">
              <p className="text-gray-700">{selectedResource.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Resource Content */}
        <Card className="flex-1">
          <CardContent className="p-6">
            {/* Normalize resourceType for safe comparisons */}
            {(() => {
              const resourceType = String(selectedResource?.resourceType || '');

              return (
                <>
                  {resourceType === 'VIDEO' && selectedResource?.fileUrl && (
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <video 
                        controls 
                        className="w-full h-full"
                        poster="/placeholder-video.png"
                      >
                        <source src={selectedResource.fileUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {(resourceType === 'PDF' || resourceType === 'DOCUMENT') && selectedResource?.fileUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{selectedResource.title}</h4>
                            <p className="text-sm text-gray-600">Document</p>
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <a href={selectedResource.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Open Document
                          </a>
                        </Button>
                      </div>
                      
                      {/* Embedded PDF viewer */}
                      <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                        <iframe
                          src={selectedResource.fileUrl}
                          className="w-full h-full"
                          title={selectedResource.title}
                        />
                      </div>
                    </div>
                  )}

                  {resourceType === 'LINK' && selectedResource?.link && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <LinkIcon className="h-8 w-8 text-purple-600" />
                          <div>
                            <h4 className="font-medium">{selectedResource.title}</h4>
                            <p className="text-sm text-gray-600">External Link</p>
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <a href={selectedResource.link} target="_blank" rel="noopener noreferrer">
                            Visit Link
                          </a>
                        </Button>
                      </div>
                      
                      {/* Embedded link preview */}
                      <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                        <iframe
                          src={selectedResource.link}
                          className="w-full h-full"
                          title={selectedResource.title}
                        />
                      </div>
                    </div>
                  )}

                  {resourceType === 'SLIDE' && selectedResource?.fileUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-orange-600" />
                          <div>
                            <h4 className="font-medium">{selectedResource.title}</h4>
                            <p className="text-sm text-gray-600">Presentation Slides</p>
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <a href={selectedResource.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Open Slides
                          </a>
                        </Button>
                      </div>
                      
                      {/* Embedded slides viewer */}
                      <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                        <iframe
                          src={selectedResource.fileUrl}
                          className="w-full h-full"
                          title={selectedResource.title}
                        />
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Course</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/student/my-courses')} className="w-full">
              Back to My Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Course Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/student/my-courses')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-lg">Course Content</h1>
              <p className="text-sm text-gray-600">Learning Modules</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{modules.length > 0 ? `0 of ${modules.length}` : '0 of 0'} modules</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/student/course/${courseId}/assignments`)}
              className="w-full flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View Assignments
            </Button>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto">
          {modules.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No modules available</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {modules.map((module, moduleIndex) => (
                <Card key={module.id} className="overflow-hidden">
                  <CardHeader 
                    className="p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleModuleExpansion(module.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {moduleIndex + 1}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm truncate">{module.title}</h3>
                          <p className="text-xs text-gray-500">
                            {module.resources?.length || 0} resources
                          </p>
                        </div>
                      </div>
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  
                  {expandedModules.has(module.id) && (
                    <CardContent className="p-0">
                      <div className="border-t border-gray-100">
                        {module.resources && module.resources.length > 0 ? (
                          module.resources.map((resource, resourceIndex) => (
                            <div
                              key={resource.id}
                              className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                                selectedResource?.id === resource.id ? 'bg-blue-50 border-blue-200' : ''
                              }`}
                              onClick={() => selectResource(module, resource)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 flex items-center justify-center">
                                  {getResourceIcon(resource.resourceType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium truncate">{resource.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs ${getResourceTypeBadge(resource.resourceType)}`}
                                    >
                                      {resource.resourceType}
                                    </Badge>
                                  </div>
                                </div>
                                {selectedResource?.id === resource.id && (
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-gray-500">
                            <p className="text-xs">No resources available</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Student Profile in Sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{profile?.firstName} {profile?.lastName}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation - Simplified */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/student/my-courses')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to My Courses</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderResourceContent()}
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;