export interface Sponsor {
  name: string;
  blurb: string;
  link: string;
  logo: string | null;
}

// NOTE: logos are hotlinked from the old Shopify CDN as a placeholder.
// Per PROJECT_BRIEF.md open decisions, re-request/re-upload originals from
// sponsors once available and move them into /public/sponsors/.
export const sponsors: Sponsor[] = [
  {
    name: "Amosson Chiropractic",
    blurb:
      "A complete approach to healthcare — spinal adjustments, acupuncture, massage therapy, and laser treatments. Serving the Cedar Valley since 1998!",
    link: 'https://share.google/0KlOfyRsMDbYU0BT8',
    logo: 'https://luckypennykitties.org/cdn/shop/files/1000106596.jpg?v=1757360613&width=1500',
  },
  {
    name: 'Paws on Your Heart Pet Rescue Support',
    blurb:
      'A miracle organization providing monetary support, guidance, and community cheerleading for rescues — a network for help and guidance.',
    link: 'https://www.facebook.com/share/1KKZMki9TD/',
    logo: 'https://luckypennykitties.org/cdn/shop/files/1000132656.jpg?v=1771271836&width=1500',
  },
  {
    name: "Dr. Elsey's",
    blurb: '',
    link: 'https://drelseysonline.com',
    logo: 'https://luckypennykitties.org/cdn/shop/files/3448.png?v=1774289097&width=1500',
  },
];
