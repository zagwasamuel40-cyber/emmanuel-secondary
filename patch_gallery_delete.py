import re

with open("src/pages/StudentPortalManager.tsx", "r") as f:
    content = f.read()

old_block = """                    <div key={item.id} className="rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white group">
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
                    </div>"""

new_block = """                    <div key={item.id} className="rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white flex flex-col">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={item.url} 
                          alt={item.caption} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full tracking-wider mb-1">
                            {item.category}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm truncate" title={item.caption}>{item.caption}</h3>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 p-2 h-auto shrink-0 border border-transparent hover:border-rose-100"
                          onClick={() => {
                            if(window.confirm("Are you sure you want to delete this image?")) {
                              setGallery(gallery.filter(g => g.id !== item.id));
                              setSuccessMsg("Image deleted successfully.");
                              setTimeout(() => setSuccessMsg(""), 3000);
                            }
                          }}
                          title="Delete Image"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>"""

content = content.replace(old_block, new_block)

with open("src/pages/StudentPortalManager.tsx", "w") as f:
    f.write(content)
