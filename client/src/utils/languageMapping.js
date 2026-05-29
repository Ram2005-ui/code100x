export const LANGUAGE_MAPPING = {
  71: 'Python',
  63: 'JavaScript',
  54: 'C++',
  62: 'Java'
};

export const getLanguageName = (id) => {
  return LANGUAGE_MAPPING[id] || `Unknown (${id})`;
};
