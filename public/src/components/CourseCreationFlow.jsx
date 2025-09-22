import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BookOpen,
  Plus,
  Save,
  Eye,
  Edit,
  Trash2,
  Upload,
  Video,
  FileText,
  Image,
  File,
  Play,
  Pause,
  ChevronRight,
  ChevronDown,
  Copy,
  Move,
  Settings,
  Users,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  ExternalLink,
  Link,
  Folder,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  ArrowLeft,
  ArrowRight,
  Home,
  FolderOpen,
  FolderPlus,
  X,
  PlusCircle,
  MinusCircle,
  GripVertical,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Heart,
  Share,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  Hash as HashIcon2,
  AtSign as AtSignIcon2,
  Hash as HashIcon3,
  AtSign as AtSignIcon3,
  Hash as HashIcon4,
  AtSign as AtSignIcon4,
  Hash as HashIcon5,
  AtSign as AtSignIcon5,
  Hash as HashIcon6,
  AtSign as AtSignIcon6,
  Hash as HashIcon7,
  AtSign as AtSignIcon7,
  Hash as HashIcon8,
  AtSign as AtSignIcon8,
  Hash as HashIcon9,
  AtSign as AtSignIcon9,
  Hash as HashIcon10,
  AtSign as AtSignIcon10
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const CourseCreationFlow = () => {
  const { showToast } = useToast();
  
  // State management
  const [course, setCourse] = useState({
    name: '',
    description: '',
    thumbnail: '',
    status: 'draft',
    modules: []
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  
  // Dialog states
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Form states
  const [newModule, setNewModule] = useState({ name: '', description: '', order: 0 });
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    contentType: 'file',
    fileId: '',
    youtubeEmbed: '',
    order: 0
  });
  
  const [availableFiles, setAvailableFiles] = useState([]);
  const [availableCoaches, setAvailableCoaches] = useState([]);
  const [courseAssignments, setCourseAssignments] = useState([]);
  
  // Auto-save functionality
  const autoSaveTimeoutRef = useRef(null);
  
  // Auto-save course data
  const autoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (course.name.trim()) {
        await saveCourse(true);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  // Load available files
  const loadAvailableFiles = async () => {
    try {
      const response = await fetch('/api/admin/v1/courses/uploaded-files', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setAvailableFiles(result.data.files || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  // Load available coaches
  const loadAvailableCoaches = async () => {
    try {
      const response = await fetch('/api/admin/v1/users?role=coach&limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setAvailableCoaches(result.data.users || []);
      }
    } catch (error) {
      console.error('Error loading coaches:', error);
    }
  };

  // Save course
  const saveCourse = async (isAutoSave = false) => {
    try {
      setSaving(true);
      
      const url = course._id ? 
        `/api/admin/v1/courses/${course._id}` : 
        '/api/admin/v1/courses';
      
      const method = course._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(course)
      });

      const result = await response.json();
      
      if (result.success) {
        if (!isAutoSave) {
          showToast('Course saved successfully', 'success');
        }
        
        if (!course._id) {
          setCourse(prev => ({ ...prev, _id: result.data._id }));
        }
        
        return result.data;
      } else {
        showToast(result.message || 'Error saving course', 'error');
        return null;
      }
    } catch (error) {
      console.error('Error saving course:', error);
      showToast('Error saving course', 'error');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Add module
  const addModule = async () => {
    if (!newModule.name.trim()) {
      showToast('Please enter module name', 'error');
      return;
    }

    const moduleData = {
      ...newModule,
      order: course.modules.length,
      contents: []
    };

    const updatedCourse = {
      ...course,
      modules: [...course.modules, moduleData]
    };

    setCourse(updatedCourse);
    setNewModule({ name: '', description: '', order: 0 });
    setShowModuleDialog(false);
    
    // Auto-save
    setTimeout(() => autoSave(), 100);
  };

  // Update module
  const updateModule = async (moduleIndex, updatedModule) => {
    const updatedModules = [...course.modules];
    updatedModules[moduleIndex] = { ...updatedModules[moduleIndex], ...updatedModule };
    
    setCourse(prev => ({ ...prev, modules: updatedModules }));
    
    // Auto-save
    setTimeout(() => autoSave(), 100);
  };

  // Delete module
  const deleteModule = async (moduleIndex) => {
    const updatedModules = course.modules.filter((_, index) => index !== moduleIndex);
    
    setCourse(prev => ({ ...prev, modules: updatedModules }));
    
    // Auto-save
    setTimeout(() => autoSave(), 100);
  };

  // Add content to module
  const addContentToModule = async (moduleIndex) => {
    if (!newContent.title.trim()) {
      showToast('Please enter content title', 'error');
      return;
    }

    if (newContent.contentType === 'file' && !newContent.fileId) {
      showToast('Please select a file', 'error');
      return;
    }

    if (newContent.contentType === 'youtube' && !newContent.youtubeEmbed) {
      showToast('Please enter YouTube embed URL', 'error');
      return;
    }

    const contentData = {
      ...newContent,
      order: course.modules[moduleIndex].contents.length
    };

    const updatedModules = [...course.modules];
    updatedModules[moduleIndex].contents.push(contentData);
    
    setCourse(prev => ({ ...prev, modules: updatedModules }));
    setNewContent({
      title: '',
      description: '',
      contentType: 'file',
      fileId: '',
      youtubeEmbed: '',
      order: 0
    });
    setShowContentDialog(false);
    
    // Auto-save
    setTimeout(() => autoSave(), 100);
  };

  // Update content
  const updateContent = async (moduleIndex, contentIndex, updatedContent) => {
    const updatedModules = [...course.modules];
    updatedModules[moduleIndex].contents[contentIndex] = {
      ...updatedModules[moduleIndex].contents[contentIndex],
      ...updatedContent
    };
    
    setCourse(prev => ({ ...prev, modules: updatedModules }));
    
    // Auto-save
    setTimeout(() => autoSave(), 100);
  };

  // Delete content
  const deleteContent = async (moduleIndex, contentIndex) => {
    const updatedModules = [...course.modules];
    updatedModules[moduleIndex].contents.splice(contentIndex, 1);
    
    setCourse(prev => ({ ...prev, modules: updatedModules }));
    
    // Auto-save
    setTimeout(() => autoSave(), 100);
  };

  // Toggle module expansion
  const toggleModuleExpansion = (moduleIndex) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleIndex)) {
      newExpanded.delete(moduleIndex);
    } else {
      newExpanded.add(moduleIndex);
    }
    setExpandedModules(newExpanded);
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'video': return <Video className="h-4 w-4 text-red-500" />;
      case 'image': return <Image className="h-4 w-4 text-green-500" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
      case 'document': return <File className="h-4 w-4 text-blue-500" />;
      default: return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get content icon
  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 'file': return <File className="h-4 w-4 text-blue-500" />;
      case 'youtube': return <Play className="h-4 w-4 text-red-500" />;
      default: return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadAvailableFiles();
    loadAvailableCoaches();
  }, []);

  // Auto-save on course changes
  useEffect(() => {
    autoSave();
  }, [course]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Creation</h1>
          <p className="text-muted-foreground">
            Create and manage comprehensive courses with modules and content
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowPreviewDialog(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => saveCourse()}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Course'}
          </Button>
        </div>
      </div>

      {/* Course Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Course Overview</CardTitle>
          <CardDescription>
            Basic information about your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course-name">Course Name *</Label>
              <Input
                id="course-name"
                value={course.name}
                onChange={(e) => setCourse(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter course name"
              />
            </div>
            <div>
              <Label htmlFor="course-status">Status</Label>
              <Select value={course.status} onValueChange={(value) => setCourse(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              value={course.description}
              onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter course description"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="course-thumbnail">Thumbnail URL</Label>
            <Input
              id="course-thumbnail"
              value={course.thumbnail}
              onChange={(e) => setCourse(prev => ({ ...prev, thumbnail: e.target.value }))}
              placeholder="Enter thumbnail URL"
            />
          </div>
        </CardContent>
      </Card>

      {/* Course Modules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Modules</CardTitle>
              <CardDescription>
                Organize your course content into modules
              </CardDescription>
            </div>
            <Button onClick={() => setShowModuleDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {course.modules.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No modules yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first module to start building your course
              </p>
              <Button onClick={() => setShowModuleDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Module
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <Card key={moduleIndex} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModuleExpansion(moduleIndex)}
                        >
                          {expandedModules.has(moduleIndex) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                        <div>
                          <h3 className="font-semibold">{module.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.contents.length} content items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedModule(moduleIndex);
                            setShowContentDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Content
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedModule(moduleIndex);
                            setNewModule(module);
                            setShowModuleDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteModule(moduleIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedModules.has(moduleIndex) && (
                    <CardContent>
                      <div className="space-y-3">
                        {module.contents.map((content, contentIndex) => (
                          <div key={contentIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getContentIcon(content.contentType)}
                              <div>
                                <h4 className="font-medium">{content.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {content.contentType === 'file' ? 'File Content' : 'YouTube Video'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedContent({ moduleIndex, contentIndex, content });
                                  setNewContent(content);
                                  setShowContentDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteContent(moduleIndex, contentIndex)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {module.contents.length === 0 && (
                          <div className="text-center py-8">
                            <File className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground mb-2">No content in this module</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedModule(moduleIndex);
                                setShowContentDialog(true);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Content
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Assignment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Assignment</CardTitle>
              <CardDescription>
                Assign this course to specific coaches
              </CardDescription>
            </div>
            <Button onClick={() => setShowAssignmentDialog(true)}>
              <Users className="w-4 h-4 mr-2" />
              Assign to Coaches
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {courseAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-2">No coaches assigned yet</p>
              <Button
                variant="outline"
                onClick={() => setShowAssignmentDialog(true)}
              >
                <Users className="w-4 h-4 mr-1" />
                Assign Coaches
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {courseAssignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {assignment.coach.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{assignment.coach.name}</h4>
                      <p className="text-sm text-muted-foreground">{assignment.coach.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={assignment.permissions.canSell ? 'default' : 'secondary'}>
                      {assignment.permissions.canSell ? 'Can Sell' : 'Cannot Sell'}
                    </Badge>
                    <Badge variant={assignment.permissions.canModify ? 'default' : 'secondary'}>
                      {assignment.permissions.canModify ? 'Can Modify' : 'Cannot Modify'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedModule !== null ? 'Edit Module' : 'Create New Module'}
            </DialogTitle>
            <DialogDescription>
              {selectedModule !== null ? 'Update module information' : 'Add a new module to your course'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module-name">Module Name *</Label>
              <Input
                id="module-name"
                value={newModule.name}
                onChange={(e) => setNewModule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter module name"
              />
            </div>
            <div>
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={newModule.description}
                onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter module description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addModule}>
              {selectedModule !== null ? 'Update Module' : 'Create Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedContent ? 'Edit Content' : 'Add Content'}
            </DialogTitle>
            <DialogDescription>
              {selectedContent ? 'Update content information' : 'Add content to this module'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="content-title">Content Title *</Label>
              <Input
                id="content-title"
                value={newContent.title}
                onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title"
              />
            </div>
            <div>
              <Label htmlFor="content-description">Description</Label>
              <Textarea
                id="content-description"
                value={newContent.description}
                onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter content description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="content-type">Content Type</Label>
              <Select 
                value={newContent.contentType} 
                onValueChange={(value) => setNewContent(prev => ({ ...prev, contentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="youtube">YouTube Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newContent.contentType === 'file' && (
              <div>
                <Label htmlFor="content-file">Select File</Label>
                <Select 
                  value={newContent.fileId} 
                  onValueChange={(value) => setNewContent(prev => ({ ...prev, fileId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a file" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFiles.map((file) => (
                      <SelectItem key={file._id} value={file._id}>
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file.fileType)}
                          <span>{file.originalName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {newContent.contentType === 'youtube' && (
              <div>
                <Label htmlFor="youtube-embed">YouTube Embed URL</Label>
                <Input
                  id="youtube-embed"
                  value={newContent.youtubeEmbed}
                  onChange={(e) => setNewContent(prev => ({ ...prev, youtubeEmbed: e.target.value }))}
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => addContentToModule(selectedModule)}>
              {selectedContent ? 'Update Content' : 'Add Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Course to Coaches</DialogTitle>
            <DialogDescription>
              Select coaches and set their permissions for this course
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Coaches</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select coaches" />
                </SelectTrigger>
                <SelectContent>
                  {availableCoaches.map((coach) => (
                    <SelectItem key={coach._id} value={coach._id}>
                      {coach.name} ({coach.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="can-view" defaultChecked />
                  <Label htmlFor="can-view">Can View</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="can-sell" />
                  <Label htmlFor="can-sell">Can Sell</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="can-modify" />
                  <Label htmlFor="can-modify">Can Modify</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle assignment logic here
              setShowAssignmentDialog(false);
            }}>
              Assign Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
            <DialogDescription>
              Preview how your course will appear to students
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{course.name || 'Untitled Course'}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{module.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                      <div className="space-y-2">
                        {module.contents.map((content, contentIndex) => (
                          <div key={contentIndex} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            {getContentIcon(content.contentType)}
                            <span className="text-sm">{content.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseCreationFlow;
