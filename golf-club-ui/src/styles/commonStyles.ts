import { Theme } from '@mui/material/styles';

export const commonStyles = (theme: Theme) => ({
  pageContainer: {
    p: 3,
    maxWidth: 1200,
    mx: 'auto',
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    p: 3,
    mb: 2,
    borderRadius: 2,
    boxShadow: 1,
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 3,
    },
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

export type CommonStylesKeys = keyof ReturnType<typeof commonStyles>; 