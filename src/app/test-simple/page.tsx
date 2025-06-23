// app/test-simple/page.tsx
export default function SimpleTestPage() {
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      lineHeight: '1.5'
    }}>
      <h1 style={{color: 'green'}}>✅ Test stránka funguje</h1>
      <p>Ak vidíte túto stránku v Safari:</p>
      <ul>
        <li>✅ Next.js server beží správne</li>
        <li>✅ Routing funguje</li>
        <li>✅ Základné CSS sa aplikuje</li>
      </ul>
      
      <button 
        onClick={() => alert('JavaScript funguje!')}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Test JavaScript
      </button>
      
      <div style={{marginTop: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px'}}>
        <h3>Informácie o prehliadači:</h3>
        <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}</p>
        <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server'}</p>
      </div>
    </div>
  )
}
