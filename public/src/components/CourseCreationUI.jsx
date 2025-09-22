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
  Trash2, 
  Edit, 
  Save, 
  Eye, 
  Play, 
  FileText, 
  Video, 
  Image, 
  Link, 
  Upload, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Copy,
  ExternalLink,
  Settings,
  FolderOpen,
  Search
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const CourseCreationUI = () => {
  const { showToast } = useToast();
  const autosaveTimeoutRef = useRef(null);
  
  // State management
  const [course, setCourse] = useState({
    name: '',
    description: '',
    thumbnail: '',
    status: 'draft',
    modules: []
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [fileSearchTerm, setFileSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');

  // Load uploaded files
  const loadUploadedFiles = async () => {
    try {
      const params = new URLSearchParams({
        page: 1,
        limit: 100,
        fileType: fileTypeFilter,
        search: fileSearchTerm
      });

      const response = await fetch(`/api/admin/v1/courses/uploaded-files?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedFiles(result.data.files);
      }
    } catch (error) {
      console.error('Error loading uploaded files:', error);
    }
  };

  // Autosave functionality
  const autosave = async () => {
    if (!course.name.trim()) return;

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
        if (!course._id) {
          setCourse(prev => ({ ...prev, _id: result.data._id }));
        }
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error autosaving:', error);
    } finally {
      setSaving(false);
    }
  };

  // Debounced autosave
  useEffect(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      autosave();
    }, 2000);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [course]);

  // Load uploaded files when dialog opens
  useEffect(() => {
    if (showFileDialog) {
      loadUploadedFiles();
    }
  }, [showFileDialog, fileTypeFilter, fileSearchTerm]);

  // Add new module
  const addModule = () => {
    const newModule = {
      name: '',
      description: '',
      order: course.modules.length,
      contents: []
    };
    
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
    
    setEditingModule(newModule);
    setShowModuleDialog(true);
  };

  // Update module
  const updateModule = (moduleIndex, updatedModule) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) => 
        index === moduleIndex ? updatedModule : module
      )
    }));
  };

  // Delete module
  const deleteModule = (moduleIndex) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.filter((_, index) => index !== moduleIndex)
    }));
  };

  // Add content to module
  const addContent = (moduleIndex) => {
    const newContent = {
      title: '',
      description: '',
      contentType: 'file',
      fileId: null,
      youtubeEmbed: '',
      order: course.modules[moduleIndex].contents.length
    };
    
    setSelectedModule(moduleIndex);
    setEditingContent(newContent);
    setShowContentDialog(true);
  };

  // Update content
  const updateContent = (moduleIndex, contentIndex, updatedContent) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) => 
        index === moduleIndex ? {
          ...module,
          contents: module.contents.map((content, cIndex) => 
            cIndex === contentIndex ? updatedContent : content
          )
        } : module
      )
    }));
  };

  // Delete content
  const deleteContent = (moduleIndex, contentIndex) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) => 
        index === moduleIndex ? {
          ...module,
          contents: module.contents.filter((_, cIndex) => cIndex !== contentIndex)
        } : module
      )
    }));
  };

  // Move content up/down
  const moveContent = (moduleIndex, contentIndex, direction) => {
    const module = course.modules[moduleIndex];
    const contents = [...module.contents];
    const newIndex = direction === 'up' ? contentIndex - 1 : contentIndex + 1;
    
    if (newIndex >= 0 && newIndex < contents.length) {
      [contents[contentIndex], contents[newIndex]] = [contents[newIndex], contents[contentIndex]];
      
      setCourse(prev => ({
        ...prev,
        modules: prev.modules.map((mod, index) => 
          index === moduleIndex ? { ...mod, contents } : mod
        )
      }));
    }
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'video': return <Video className="h-4 w-4 text-red-500" />;
      case 'image': return <Image className="h-4 w-4 text-green-500" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
      case 'document': return <FileText className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Creation</h1>
          <p className="text-muted-foreground">Create comprehensive courses with modules and content</p>
        </div>
        <div className="flex items-center space-x-2">
          {lastSaved && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          {saving && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          <Button onClick={autosave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Now
          </Button>
        </div>
      </div>

      {/* Course Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Basic details about your course</CardDescription>
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
              <Select 
                value={course.status} 
                onValueChange={(value) => setCourse(prev => ({ ...prev, status: value }))}
              >
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
              <CardDescription>Organize your course content into modules</CardDescription>
            </div>
            <Button onClick={addModule}>
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {course.modules.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No modules created</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first module to organize your course content
              </p>
              <Button onClick={addModule}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Module
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <Card key={moduleIndex} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {moduleIndex + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{module.name || 'Untitled Module'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.contents.length} content items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addContent(moduleIndex)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Content
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingModule(module);
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
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {module.description && (
                      <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    )}
                    
                    {module.contents.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No content added yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {module.contents.map((content, contentIndex) => (
                          <div key={contentIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {contentIndex + 1}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {content.contentType === 'youtube' ? (
                                  <Link className="h-4 w-4 text-red-500" />
                                ) : (
                                  getFileIcon(content.fileType || 'document')
                                )}
                                <span className="text-sm font-medium">
                                  {content.title || 'Untitled Content'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveContent(moduleIndex, contentIndex, 'up')}
                                disabled={contentIndex === 0}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveContent(moduleIndex, contentIndex, 'down')}
                                disabled={contentIndex === module.contents.length - 1}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingContent(content);
                                  setSelectedModule(moduleIndex);
                                  setShowContentDialog(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteContent(moduleIndex, contentIndex)}
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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
              {editingModule ? 'Edit Module' : 'Add New Module'}
            </DialogTitle>
            <DialogDescription>
              Configure module details and content organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module-name">Module Name *</Label>
              <Input
                id="module-name"
                value={editingModule?.name || ''}
                onChange={(e) => setEditingModule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter module name"
              />
            </div>
            <div>
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={editingModule?.description || ''}
                onChange={(e) => setEditingModule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter module description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingModule) {
                const moduleIndex = course.modules.findIndex(m => m === editingModule);
                if (moduleIndex !== -1) {
                  updateModule(moduleIndex, editingModule);
                }
              }
              setShowModuleDialog(false);
              setEditingModule(null);
            }}>
              Save Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Edit Content' : 'Add New Content'}
            </DialogTitle>
            <DialogDescription>
              Add files or YouTube videos to your course content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="content-title">Content Title *</Label>
                <Input
                  id="content-title"
                  value={editingContent?.title || ''}
                  onChange={(e) => setEditingContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter content title"
                />
              </div>
              <div>
                <Label htmlFor="content-type">Content Type</Label>
                <Select 
                  value={editingContent?.contentType || 'file'} 
                  onValueChange={(value) => setEditingContent(prev => ({ ...prev, contentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">Uploaded File</SelectItem>
                    <SelectItem value="youtube">YouTube Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="content-description">Description</Label>
              <Textarea
                id="content-description"
                value={editingContent?.description || ''}
                onChange={(e) => setEditingContent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter content description"
                rows={3}
              />
            </div>

            {editingContent?.contentType === 'file' ? (
              <div>
                <Label>Select File</Label>
                <div className="mt-2">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search files..."
                          value={fileSearchTerm}
                          onChange={(e) => setFileSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="pdf">PDFs</SelectItem>
                        <SelectItem value="document">Documents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file._id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          editingContent?.fileId === file._id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setEditingContent(prev => ({ ...prev, fileId: file._id }))}
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.fileType)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.originalName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {file.fileType}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="youtube-embed">YouTube Embed URL</Label>
                <Input
                  id="youtube-embed"
                  value={editingContent?.youtubeEmbed || ''}
                  onChange={(e) => setEditingContent(prev => ({ ...prev, youtubeEmbed: e.target.value }))}
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use the embed URL format: https://www.youtube.com/embed/VIDEO_ID
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingContent && selectedModule !== null) {
                const contentIndex = course.modules[selectedModule].contents.findIndex(c => c === editingContent);
                if (contentIndex !== -1) {
                  updateContent(selectedModule, contentIndex, editingContent);
                } else {
                  // Add new content
                  setCourse(prev => ({
                    ...prev,
                    modules: prev.modules.map((module, index) => 
                      index === selectedModule ? {
                        ...module,
                        contents: [...module.contents, editingContent]
                      } : module
                    )
                  }));
                }
              }
              setShowContentDialog(false);
              setEditingContent(null);
              setSelectedModule(null);
            }}>
              Save Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseCreationUI;
