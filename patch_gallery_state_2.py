import re

with open("src/pages/StudentPortalManager.tsx", "r") as f:
    content = f.read()

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
      category: newGalleryCategory as any
    };
    setGallery([newItem, ...gallery]);
    setNewGalleryUrl("");
    setNewGalleryCaption("");
    setSuccessMsg("Image added to gallery!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };
"""

content = content.replace(
    "  const toggleFeature = (id: number) => {",
    form_state + "\n  const toggleFeature = (id: number) => {"
)

with open("src/pages/StudentPortalManager.tsx", "w") as f:
    f.write(content)
