import React, { useState, useEffect } from "react";
import { getMedia, createMedia, updateMedia, Media } from "../../services/media";
import {FolderArrowDownIcon} from "@heroicons/react/24/outline";
import {open} from "@tauri-apps/plugin-dialog";
interface CustomizePopupProps {
  onClose: () => void;
  journalId: string;
}

const CustomizePopup: React.FC<CustomizePopupProps> = ({ onClose, journalId }) => {
  const [titleFont, setTitleFont] = useState("Arial");
  const [bodyFont, setBodyFont] = useState("Roboto");
  const [primaryColor, setPrimaryColor] = useState("#ffffff");
  const [secondaryColor, setSecondaryColor] = useState("#f0f0f0");
  const [textColor, setTextColor] = useState("#000000");
  const [wallpaperImage, setWallpaperImage] = useState("");
  const [isWallpaperEnabled, setIsWallpaperEnabled] = useState(false);
  const [isCustomEnabled, setIsCustomEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch media data when the component mounts
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const media = await getMedia(journalId);
        if (media) {
          setTitleFont(media.font_title || "Arial");
          setBodyFont(media.font_body || "Roboto");
          setPrimaryColor(media.primary_color || "#ffffff");
          setSecondaryColor(media.secondary_color || "#f0f0f0");
          setTextColor(media.text_color || "#000000");
          setWallpaperImage(media.backgroundimage || "");
          setIsWallpaperEnabled(media.isbgenabled || false);
          setIsCustomEnabled(media.customenabled || false);
        }
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [journalId]);

  const handleSave = async () => {
    const media: Media = {
      journal_id: journalId,
      customenabled: isCustomEnabled,
      backgroundimage: wallpaperImage,
      isbgenabled: isWallpaperEnabled,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      text_color: textColor,
      font_title: titleFont,
      font_body: bodyFont,
    };

    try {
      const existingMedia = await getMedia(journalId);
      if (existingMedia) {
        await updateMedia(media);
        console.log("Media updated successfully");
      } else {
        await createMedia(media);
        console.log("Media created successfully");
      }
    } catch (error) {
      console.error("Failed to save media:", error);
    } finally {
      onClose();
    }
  };

  const handleFilePicker = async () => {
    await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "jpeg", "png", "gif"],
        },
      ],
    }).then((filePath) => {
      if (filePath) {
        setWallpaperImage(filePath as string);
      }
    })
    console.log("File picker clicked");
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="glass-blur bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-black/20 rounded-xl shadow-lg p-6 w-[90%] max-w-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Customize Journal</h2>
        <div className="space-y-4">
          {/* Customize Journal Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isCustomEnabled}
              onChange={(e) => setIsCustomEnabled(e.target.checked)}
              className="h-4 w-4"
            />
            <label className="text-sm text-white">Customize Journal</label>
          </div>

          {/* Title Font */}
          <div>
            <label className="block text-sm text-white mb-1">Title Font</label>
            <input
              type="text"
              value={titleFont}
              onChange={(e) => setTitleFont(e.target.value)}
              className="w-full rounded-md bg-transparent border border-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* Body Font */}
          <div>
            <label className="block text-sm text-white mb-1">Body Font</label>
            <input
              type="text"
              value={bodyFont}
              onChange={(e) => setBodyFont(e.target.value)}
              className="w-full rounded-md bg-transparent border border-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white mb-1">Primary Color</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full h-10"
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Secondary Color</label>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-full h-10"
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10"
              />
            </div>
          </div>

          {/* Wallpaper */}
          <div>
            <label className="block text-sm text-white mb-1">Wallpaper Image Path/URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={wallpaperImage}
                onChange={(e) => setWallpaperImage(e.target.value)}
                className="w-full rounded-md bg-transparent border border-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button
                onClick={handleFilePicker}
                className="p-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
              >
                <FolderArrowDownIcon name="folder-arrow-down" className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isWallpaperEnabled}
                onChange={(e) => setIsWallpaperEnabled(e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm text-white">Enable Wallpaper Image</label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizePopup;