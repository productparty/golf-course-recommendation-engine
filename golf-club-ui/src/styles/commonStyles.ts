import { Theme } from '@mui/material/styles';

export const commonStyles = (theme: Theme) => ({
  pageContainer: {
    py: 4,
  },
  card: {
    p: 3,
    mb: 2,
    borderRadius: 2,
    boxShadow: 1,
    '&:hover': {
      boxShadow: 3,
    },
  },
  sectionTitle: {
    color: 'primary.main',
    mb: 2,
    fontWeight: 'medium',
  },
  formControl: {
    mb: 2,
    width: '100%',
  },
  button: {
    borderRadius: 2,
    textTransform: 'none',
    py: 1,
    px: 3,
  },
  searchResults: {
    mt: 4,
  },
  resultItem: {
    p: 2,
    mb: 2,
    borderRadius: 1,
    border: '1px solid',
    borderColor: 'divider',
  },
  badge: {
    px: 1,
    py: 0.5,
    borderRadius: 1,
    fontSize: '0.875rem',
    fontWeight: 'medium',
  },
}); 