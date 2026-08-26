import re

with open("src/pages/public/Admissions.tsx", "r") as f:
    content = f.read()

# Add states for base64
old_states = """  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [previousResultFile, setPreviousResultFile] = useState<File | null>(null);
  const [passportPhotoFile, setPassportPhotoFile] = useState<File | null>(null);"""

new_states = """  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [previousResultFile, setPreviousResultFile] = useState<File | null>(null);
  const [passportPhotoFile, setPassportPhotoFile] = useState<File | null>(null);
  const [birthCertBase64, setBirthCertBase64] = useState<string>("");
  const [previousResultBase64, setPreviousResultBase64] = useState<string>("");
  const [passportPhotoBase64, setPassportPhotoBase64] = useState<string>("");"""
content = content.replace(old_states, new_states)

# Modify handleFileChange to also read base64
old_file_change = """  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };"""

new_file_change = """  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setBase64?: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      if (setBase64) {
        const reader = new FileReader();
        reader.onloadend = () => setBase64(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };"""
content = content.replace(old_file_change, new_file_change)

old_handle_drop = """  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setDragState: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };"""

new_handle_drop = """  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setDragState: React.Dispatch<React.SetStateAction<boolean>>,
    setBase64?: React.Dispatch<React.SetStateAction<string>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFile(file);
      if (setBase64) {
        const reader = new FileReader();
        reader.onloadend = () => setBase64(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };"""
content = content.replace(old_handle_drop, new_handle_drop)

# Update the calls to handleFileChange and handleDrop
content = content.replace("onChange={(e) => handleFileChange(e, setBirthCertFile)}", "onChange={(e) => handleFileChange(e, setBirthCertFile, setBirthCertBase64)}")
content = content.replace("onDrop={(e) => handleDrop(e, setBirthCertFile, setDragActiveBirth)}", "onDrop={(e) => handleDrop(e, setBirthCertFile, setDragActiveBirth, setBirthCertBase64)}")

content = content.replace("onChange={(e) => handleFileChange(e, setPreviousResultFile)}", "onChange={(e) => handleFileChange(e, setPreviousResultFile, setPreviousResultBase64)}")
content = content.replace("onDrop={(e) => handleDrop(e, setPreviousResultFile, setDragActiveResult)}", "onDrop={(e) => handleDrop(e, setPreviousResultFile, setDragActiveResult, setPreviousResultBase64)}")

content = content.replace("onChange={(e) => handleFileChange(e, setPassportPhotoFile)}", "onChange={(e) => handleFileChange(e, setPassportPhotoFile, setPassportPhotoBase64)}")
content = content.replace("onDrop={(e) => handleDrop(e, setPassportPhotoFile, setDragActivePassport)}", "onDrop={(e) => handleDrop(e, setPassportPhotoFile, setDragActivePassport, setPassportPhotoBase64)}")


# Update the submit to include documentUrls
old_submit = """    // Save to admissionApps state
    const newApp = {
      id: generatedId,
      name: `${firstName} ${lastName}`.trim(),
      class: classApplying,
      assignedClass: classApplying,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      payment: "Paid",
      phone: parentPhone
    };"""

new_submit = """    // Save to admissionApps state
    const newApp = {
      id: generatedId,
      name: `${firstName} ${lastName}`.trim(),
      class: classApplying,
      assignedClass: classApplying,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      payment: "Paid",
      phone: parentPhone,
      documentsUrls: {
        birthCert: birthCertBase64,
        previousResult: previousResultBase64,
        passportPhoto: passportPhotoBase64
      }
    };"""
content = content.replace(old_submit, new_submit)

with open("src/pages/public/Admissions.tsx", "w") as f:
    f.write(content)
