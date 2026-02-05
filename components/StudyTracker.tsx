
import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Circle, Plus, Trash2, Layout, ChevronRight, ChevronDown } from 'lucide-react';
import { StudyItem } from '../types';

const StudyTracker: React.FC = () => {
  const [courses, setCourses] = useState<StudyItem[]>([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('solomon_study');
    if (saved) setCourses(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('solomon_study', JSON.stringify(courses));
  }, [courses]);

  const addCourse = () => {
    if (!newCourseName.trim()) return;
    const course: StudyItem = {
      id: Date.now().toString(),
      name: newCourseName,
      progress: 0,
      topics: []
    };
    setCourses([...courses, course]);
    setNewCourseName('');
    setShowAddCourse(false);
    setOpenCourseId(course.id);
  };

  const deleteCourse = (id: string) => {
    if (confirm('Delete this course?')) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const addTopic = (courseId: string) => {
    const topicName = prompt('Enter topic name:');
    if (!topicName) return;

    setCourses(courses.map(c => {
      if (c.id === courseId) {
        const updatedTopics = [...c.topics, { id: Date.now().toString(), name: topicName, completed: false }];
        return { ...c, topics: updatedTopics, progress: calculateProgress(updatedTopics) };
      }
      return c;
    }));
  };

  const toggleTopic = (courseId: string, topicId: string) => {
    setCourses(courses.map(c => {
      if (c.id === courseId) {
        const updatedTopics = c.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t);
        return { ...c, topics: updatedTopics, progress: calculateProgress(updatedTopics) };
      }
      return c;
    }));
  };

  const calculateProgress = (topics: any[]) => {
    if (topics.length === 0) return 0;
    const completed = topics.filter(t => t.completed).length;
    return Math.round((completed / topics.length) * 100);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          Study Master
        </h2>
        <button 
          onClick={() => setShowAddCourse(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all"
        >
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>

      <div className="space-y-4">
        {courses.map(course => (
          <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div 
              className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
              onClick={() => setOpenCourseId(openCourseId === course.id ? null : course.id)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-slate-800 rounded-xl text-indigo-400">
                  <Layout className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{course.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[200px]">
                      <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{course.progress}% Complete</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteCourse(course.id); }}
                  className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {openCourseId === course.id ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
              </div>
            </div>

            {openCourseId === course.id && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-800 animate-in slide-in-from-top-2">
                <div className="space-y-2 mb-6">
                  {course.topics.map(topic => (
                    <div 
                      key={topic.id} 
                      onClick={() => toggleTopic(course.id, topic.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${topic.completed ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/30 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                    >
                      <div className="flex items-center gap-3">
                        {topic.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 opacity-40" />}
                        <span className={`text-sm ${topic.completed ? 'line-through opacity-60' : ''}`}>{topic.name}</span>
                      </div>
                    </div>
                  ))}
                  {course.topics.length === 0 && <p className="text-center py-4 text-sm text-slate-600">No topics added to this course yet.</p>}
                </div>
                <button 
                  onClick={() => addTopic(course.id)}
                  className="w-full py-3 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-sm hover:border-slate-700 hover:text-slate-400 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Topic / Syllabus Item
                </button>
              </div>
            )}
          </div>
        ))}
        {courses.length === 0 && (
          <div className="py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-500">
            <BookOpen className="w-12 h-12 mb-4 opacity-20" />
            <p>Ready to level up? Create your first study plan.</p>
          </div>
        )}
      </div>

      {showAddCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-white mb-6">New Course / Subject</h3>
            <div className="mb-8">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Course Name</label>
              <input 
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newCourseName}
                onChange={e => setNewCourseName(e.target.value)}
                placeholder="e.g., Computer Networks, React Advanced"
                onKeyDown={e => e.key === 'Enter' && addCourse()}
              />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowAddCourse(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={addCourse} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-500 transition-colors">Create Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTracker;
