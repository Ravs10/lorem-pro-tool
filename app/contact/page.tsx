export default function Contact() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>Contact Us</h1>
      <p>Have questions, feedback, or need help with our tools?</p>
      <p>We would love to hear from you. You can reach us at:</p>
      <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
        <p><strong>Email:</strong> contact@loremprotool.com</p>
        <p><strong>Website:</strong> lorem-pro-tool.vercel.app</p>
      </div>
      <p style={{ marginTop: '20px' }}>We usually reply within 24-48 hours.</p>
    </div>
  );
}
