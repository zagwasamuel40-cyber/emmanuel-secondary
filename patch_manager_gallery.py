import re

with open("src/pages/StudentPortalManager.tsx", "r") as f:
    content = f.read()

imports = 'import { useGallery } from "../data/galleryData";\nimport { Camera } from "lucide-react";\n'
if "useGallery" not in content:
    content = content.replace(
        'import { useComments } from "../data/commentsData";',
        imports + 'import { useComments } from "../data/commentsData";'
    )

if 'useState<"news" | "branding" | "features" | "comments">' in content:
    content = content.replace(
        'useState<"news" | "branding" | "features" | "comments">',
        'useState<"news" | "branding" | "features" | "comments" | "gallery">'
    )

if 'const [comments, setComments] = useComments();' in content and 'const [gallery, setGallery] = useGallery();' not in content:
    content = content.replace(
        'const [comments, setComments] = useComments();',
        'const [comments, setComments] = useComments();\n  const [gallery, setGallery] = useGallery();'
    )

# Add local state for gallery form
form_state = """
  // Gallery Form State
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryCaption, setNewGalleryCaption] = useState("");
  const [newGalleryCategory, setNewGalleryCategory] = useState<"Staff" | "Facilities" | "Events" | "Students" | "Other">("Staff");

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newGalleryUrl || !newGalleryCaption) return;
    const newItem = {
      id: `GAL-${Math.floor(1000 + Math.random() * 9000)}`,
      url: newGalleryUrl,
      caption: newGalleryCaption,
      category: newGalleryCategory
    };
    setGallery([newItem, ...gallery]);
    setNewGalleryUrl("");
    setNewGalleryCaption("");
    setSuccessMsg("Image added to gallery!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };
"""

if 'const handleAddGalleryItem' not in content:
    content = content.replace(
        '  const handleAddFeature = () => {',
        form_state + '\n  const handleAddFeature = () => {'
    )


# Add Tab Button
tab_button = """        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'gallery' ? 'bg-purple-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Camera size={18} />
          School Gallery
        </button>
      </div>"""

if 'School Gallery' not in content:
    content = content.replace(
        '        </button>\n      </div>',
        '        </button>\n' + tab_button
    )

# Add Tab Content
tab_content = """
      {activeTab === "gallery" && (
        <div className="space-y-6">
          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="text-purple-600" size={20} /> Add New Gallery Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddGalleryItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Image URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        required 
                        value={newGalleryUrl} 
                        onChange={e => setNewGalleryUrl(e.target.value)} 
                        placeholder="e.g. https://images.unsplash.com/photo-..." 
                      />
                      <Label className="cursor-pointer flex items-center justify-center bg-slate-100 border border-slate-200 rounded-md px-3 hover:bg-slate-200 transition-colors">
                        <Upload size={16} className="text-slate-500 mr-2" />
                        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Upload Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewGalleryUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                      value={newGalleryCategory}
                      onChange={e => setNewGalleryCategory(e.target.value as any)}
                    >
                      <option value="Staff">Staff</option>
                      <option value="Facilities">Facilities</option>
                      <option value="Events">Events</option>
                      <option value="Students">Students</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Image Caption</Label>
                    <Input 
                      required 
                      value={newGalleryCaption} 
                      onChange={e => setNewGalleryCaption(e.target.value)} 
                      placeholder="e.g. Our Dedicated Teaching Staff" 
                    />
                  </div>
                </div>
                <Button type="submit" variant="brand" className="w-full">
                  Add to Gallery
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="text-purple-600" size={20} /> Manage Existing Images
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {gallery.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No images in gallery.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {gallery.map(item => (
                    <div key={item.id} className="rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white group">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={item.url} 
                          alt={item.caption} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              if(window.confirm("Delete this image?")) {
                                setGallery(gallery.filter(g => g.id !== item.id));
                                setSuccessMsg("Image deleted.");
                                setTimeout(() => setSuccessMsg(""), 3000);
                              }
                            }}
                          >
                            <Trash2 size={16} className="mr-2" /> Delete
                          </Button>
                        </div>
                      </div>
                      <div className="p-3">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full tracking-wider mb-1">
                          {item.category}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm truncate">{item.caption}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
"""

if 'Manage Existing Images' not in content:
    content = content.replace(
        '    </div>\n  );\n}',
        tab_content + '\n    </div>\n  );\n}'
    )

with open("src/pages/StudentPortalManager.tsx", "w") as f:
    f.write(content)
