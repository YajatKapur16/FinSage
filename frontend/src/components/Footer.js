import React from 'react';
import { Container, Grid, Typography, Link, Box, Stack, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram } from '@mui/icons-material';
import { motion } from 'framer-motion';

const footerSections = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Security', href: '#' },
      { name: 'Updates', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '#' },
      { name: 'Documentation', href: '#' },
      { name: 'API Status', href: '#' },
      { name: 'Community', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Compliance', href: '#' },
    ],
  },
];

const socialIcons = [
  { icon: <Facebook />, href: '#' },
  { icon: <Twitter />, href: '#' },
  { icon: <LinkedIn />, href: '#' },
  { icon: <Instagram />, href: '#' },
];

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#121212',
        py: 8,
        borderTop: '1px solid',
        borderColor: 'rgba(255,107,0,0.2)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,107,0,0.08) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8}>
          {/* Logo and social links */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(90deg, #FF6B00 0%, #FF8C00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                FinSage
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, maxWidth: '300px' }}>
                Take control of your finances with AI-powered insights and smart expense tracking.
              </Typography>
              <Stack direction="row" spacing={1}>
                {socialIcons.map((social, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={social.href}
                    sx={{
                      color: 'rgba(255,107,0,0.8)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        color: 'primary.main',
                        transform: 'translateY(-3px)',
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </motion.div>
          </Grid>

          {/* Footer sections */}
          {footerSections.map((section, sectionIndex) => (
            <Grid item xs={6} sm={3} md={2} key={section.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
              >
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                  {section.title}
                </Typography>
                <Stack spacing={1}>
                  {section.links.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      color="text.secondary"
                      sx={{
                        textDecoration: 'none',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          color: 'primary.main',
                          transform: 'translateX(5px)',
                          display: 'inline-block',
                        },
                      }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </Stack>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,107,0,0.2)' }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography color="text.secondary" variant="body2">
            © {new Date().getFullYear()} FinSage. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link href="#" variant="body2">Privacy</Link>
            <Link href="#" variant="body2">Terms</Link>
            <Link href="#" variant="body2">Cookie Policy</Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
