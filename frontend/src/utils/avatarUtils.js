// Generate initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Generate a consistent color based on the name
const getColorFromName = (name) => {
  if (!name) return '#6B7280';
  
  const colors = [
    '#4F46E5', // Indigo
    '#059669', // Emerald
    '#DC2626', // Red
    '#EA580C', // Orange
    '#7C3AED', // Violet
    '#BE185D', // Pink
    '#0891B2', // Cyan
    '#65A30D', // Lime
    '#9333EA', // Purple
    '#E11D48'  // Rose
  ];
  
  const colorIndex = name.length % colors.length;
  return colors[colorIndex];
};

// Create SVG avatar with initials
export const createSVGAvatar = (name, size = 100) => {
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);
  const fontSize = Math.max(size * 0.4, 12);
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size / 2}"/>
      <text x="${size / 2}" y="${size / 2 + fontSize / 3}" 
            font-family="Arial, sans-serif" 
            font-size="${fontSize}" 
            font-weight="bold" 
            text-anchor="middle" 
            fill="white" 
            dominant-baseline="middle">
        ${initials}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Get avatar URL with fallback
export const getAvatarUrl = (profilePicture, name, size = 100) => {
  if (profilePicture && profilePicture.trim() !== '') {
    return profilePicture;
  }
  return createSVGAvatar(name, size);
};

// Legacy functions for backward compatibility
export const getDefaultAvatar = (name, size = 100) => {
  return createSVGAvatar(name, size);
};

export const getColoredAvatar = (name, size = 100) => {
  return createSVGAvatar(name, size);
};
