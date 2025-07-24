import React, { useState } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  RedditShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  RedditIcon,
  EmailIcon,
} from 'react-share';
import { FiShare2, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SocialShare({ 
  url, 
  title, 
  description = '', 
  hashtags = [],
  className = '' 
}) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareDescription = description || 'Check out this amazing post!';
  const shareHashtags = hashtags.length > 0 ? hashtags : ['blog', 'article'];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Failed to share');
        }
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleNativeShare}
        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        title="Share this post"
      >
        <FiShare2 className="w-5 h-5" />
        <span className="text-sm font-medium">Share</span>
      </button>

      {/* Share Menu - only show if native sharing is not available */}
      {showShareMenu && !navigator.share && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Share this post</h3>
            <button
              onClick={() => setShowShareMenu(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiShare2 className="w-4 h-4 rotate-180" />
            </button>
          </div>

          {/* Social Media Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <FacebookShareButton
              url={shareUrl}
              quote={`${shareTitle} - ${shareDescription}`}
              hashtag={`#${shareHashtags[0]}`}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FacebookIcon size={32} round />
              <span className="text-xs text-gray-600">Facebook</span>
            </FacebookShareButton>

            <TwitterShareButton
              url={shareUrl}
              title={shareTitle}
              hashtags={shareHashtags}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TwitterIcon size={32} round />
              <span className="text-xs text-gray-600">Twitter</span>
            </TwitterShareButton>

            <LinkedinShareButton
              url={shareUrl}
              title={shareTitle}
              summary={shareDescription}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LinkedinIcon size={32} round />
              <span className="text-xs text-gray-600">LinkedIn</span>
            </LinkedinShareButton>

            <WhatsappShareButton
              url={shareUrl}
              title={`${shareTitle} - ${shareDescription}`}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <WhatsappIcon size={32} round />
              <span className="text-xs text-gray-600">WhatsApp</span>
            </WhatsappShareButton>

            <RedditShareButton
              url={shareUrl}
              title={shareTitle}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RedditIcon size={32} round />
              <span className="text-xs text-gray-600">Reddit</span>
            </RedditShareButton>

            <EmailShareButton
              url={shareUrl}
              subject={shareTitle}
              body={`${shareDescription}\n\nRead more: ${shareUrl}`}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <EmailIcon size={32} round />
              <span className="text-xs text-gray-600">Email</span>
            </EmailShareButton>
          </div>

          {/* Copy Link Button */}
          <div className="border-t border-gray-200 pt-3">
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600 font-medium">Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* URL Display */}
          <div className="mt-3 p-2 bg-gray-50 rounded border">
            <p className="text-xs text-gray-500 truncate" title={shareUrl}>
              {shareUrl}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}