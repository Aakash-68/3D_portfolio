import { useState } from 'react';
import { Github, Linkedin, Mail, FileDown } from 'lucide-react';

const contactPlatforms = [
  { name: 'GitHub', icon: Github, url: 'https://github.com/Aakash-68', alt: 'Visit my GitHub profile' },
  { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/aakash-yogabalu-0a85652a8', alt: 'Connect with me on LinkedIn' },
  { name: 'Email', icon: Mail, url: 'aakash.27@unb.ca', alt: 'Copy my email address' },
  { name: 'Download Resume', icon: FileDown, url: 'https://drive.google.com/uc?export=download&id=16jGZIDGlMPEPp9HGTrRkwF9Dm1gM26Kf', alt: 'Download my resume (PDF)' }
];

export default function ContactBar() {
  const [copied, setCopied] = useState(false);
  
  const handleEmailClick = (email) => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Hide message after 2 seconds
    });
  };
  
  return (
    <div className="w-full flex flex-col items-center justify-center mx-auto p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="inline-flex items-center px-4 py-3 rounded-full backdrop-blur-sm bg-gray-200/20 shadow-lg noise-bg">
          <div className="flex items-center gap-3">
            {contactPlatforms.map((platform) => {
              const Icon = platform.icon;
              if (platform.name === 'Email') {
                return (
                  <button
                    key={platform.name}
                    onClick={() => handleEmailClick(platform.url)}
                    aria-label={platform.alt}
                    className="group contact-icon relative flex items-center justify-center bg-gray-400/10 backdrop-blur-md rounded-full h-12 w-12 shadow-md transition-all duration-200 ease-in hover:bg-gray-300/15"
                  >
                    <Icon
                      size={22}
                      className="text-gray-600 group-hover:text-gray-800 transition-colors"
                    />
                    {/* Tooltip */}
                    <span className="absolute duration-500 ease-in-out bottom-[-3rem] text-xs bg-white text-gray-700 px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10">
                      {copied ? 'Email copied!' : platform.alt}
                    </span>
                  </button>
                );
              }
              return (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform.alt}
                  download={platform.name === 'Download Resume' ? true : undefined}
                  className="group contact-icon relative flex items-center justify-center bg-gray-400/10 backdrop-blur-md rounded-full h-12 w-12 shadow-md transition-all duration-200 ease-in hover:bg-gray-300/15"
                >
                  <Icon
                    size={22}
                    className="text-gray-600 group-hover:text-gray-800 transition-colors"
                  />
                  {/* Tooltip */}
                  <span className="absolute duration-500 ease-in-out bottom-[-3rem] text-xs bg-white text-gray-700 px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10">
                    {platform.alt}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}