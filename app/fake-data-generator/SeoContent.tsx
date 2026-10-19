'use client';
import { useState } from 'react';

function Sec({ id, title, children, openDefault = false }: any) {
  const [open, setOpen] = useState(openDefault);
  return (
    <section className="mt-6 bg-white rounded-[24px] border p-5 md:p-7">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center text-left">
        <h2 className="text-[19px] md:text-[22px] font-black leading-tight">{title}</h2>
        <span className="ml-3 shrink-0 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">{open ? '−' : '+'}</span>
      </button>
      {/* GOOGLE-FRIENDLY HIDE: content DOM me rehta hai, sirf CSS se chhupta hai */}
      <div className={open ? 'block mt-4 text-[14px] leading-8 text-zinc-700 space-y-4' : 'hidden mt-4 text-[14px] leading-8 text-zinc-700 space-y-4'}>
        {children}
      </div>
    </section>
  );
}

function Faq({ q, a, openDefault = false }: any) {
  const [open, setOpen] = useState(openDefault);
  return (
    <div className="border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 font-bold flex justify-between bg-zinc-50 text-[13px] leading-tight">{q}<span className="ml-2">{open ? '−' : '+'}</span></button>
      <div className={open ? 'block px-4 py-4 text-[13px] bg-white leading-7 text-zinc-600' : 'hidden px-4 py-4 text-[13px] bg-white leading-7 text-zinc-600'}>{a}</div>
    </div>
  );
}

export default function SeoContent() {
  return (
    <div className="mt-8">
      <h2 className="text-[22px] md:text-[28px] font-black leading-tight">Fake Data Generator - Complete Guide, User Manual & FAQs</h2>
      <p className="text-[13px] text-zinc-500 mt-2">Last Updated: May 2026 | 100% Free Tool for Developers, Testers, Students & Designers</p>

      <Sec id="what" title="1. What is Fake Data Generator?" openDefault={true}>
        <p><strong>Fake Data Generator</strong> is a free online tool that creates realistic but 100% fake dummy data like fake name, fake email, fake mobile number, fake address, city, pincode, company, PAN, Aadhaar and UPI ID for testing purpose. For example: Name: Aarav Mehta, Email: aarav.mehta1234@gmail.com, Mobile: 9876543210, Address: 123 MG Road, Delhi, Pincode: 110001. This data looks real but it is not real. No real person has this name, email or mobile number.</p>
        <p>Developers and testers need dummy data every day. When you build a website, app, form, database or API, you cannot use real user data for testing. It is risky, illegal under GDPR and DPDP Act, and unsafe. That is why we use a <strong>fake data generator</strong>, <strong>dummy data generator</strong> and <strong>test data generator</strong>. It gives you instant data in 1 click without login, without signup, without any cost.</p>
        <p>Our tool is special because it supports <strong>20 languages</strong> - 11 Indian languages like Hindi, Bhojpuri, Tamil, Telugu, Marathi, Bengali, Gujarati, Malayalam, Kannada, Punjabi, Urdu and 9 Global languages like English, Spanish, French, German, Korean, Japanese, Chinese, Russian, Arabic. Most other tools only give English names like John Smith. We give you native names like खेसारी लाल for Bhojpuri, 张伟 for Chinese, 田中太郎 for Japanese, محمد أحمد for Arabic, Иван Иванов for Russian.</p>
        <p>Fake data is also called mock data, sample data, placeholder data, dummy data, test data. All mean same - data that is used for testing, demo, design and learning, not for real use. You can generate 1 to 1000 records at once and download in JSON, CSV, TXT, SQL formats.</p>
        <h3 className="font-black text-[16px]">Why Fake Data is Needed in 2026?</h3>
        <p>In 2026, every app needs testing in multiple languages, multiple devices, and multiple screen sizes. If you test only with 2-3 names, you will miss bugs. For example, your database may crash with Chinese characters if it is not UTF-8. Your UI may break if a name is very long like a Tamil name. Your form validation may fail if mobile number format is different. With 1000 fake records, you can find all these bugs before your real users find them. That is why top companies like Google, Facebook, Amazon use fake data for testing.</p>
        <p>Students also use fake data for college projects, DBMS lab, Python projects, Java projects, and final year projects. Instead of typing 100 names manually, you can generate in 2 seconds and focus on coding.</p>
      </Sec>

      <Sec id="for-whom" title="2. For Whom is This Fake Data Generator Beneficial?">
        <p>This tool is made for everyone who works with data, design or development. Here is full list:</p>
        <h3 className="font-black text-[16px]">a) For Developers & Programmers</h3>
        <p>If you are a Frontend Developer, Backend Developer, Full Stack Developer, Android Developer, iOS Developer, you need data to test your code. Use JSON format for API testing, SQL format for database seeding, CSV for Excel import. You can test pagination, search, filter, sort with 1000 records. You can test if your app supports Hindi, Chinese, Japanese characters correctly.</p>
        <h3 className="font-black text-[16px]">b) For Software Testers / QA Engineers</h3>
        <p>QA testers need bulk data for load testing, stress testing, automation testing. Generate 1000 users and check if your login, signup, checkout works. Test edge cases like duplicate email, invalid mobile, long address. Our data is perfect for Selenium, Cypress, Playwright automation.</p>
        <h3 className="font-black text-[16px]">c) For UI / UX Designers & Figma Designers</h3>
        <p>Designers need realistic names to show in mockups, wireframes, prototypes. Lorem ipsum looks boring. Real names like Priya Sharma, Aarav Mehta make your design look professional in front of client. Use our tool for Figma, Adobe XD, Canva designs.</p>
        <h3 className="font-black text-[16px]">d) For Students & College Projects</h3>
        <p>B.Tech, BCA, MCA, Diploma students use this for DBMS, Python, Java, PHP, React projects. Generate data for student management system, hospital management system, library system, e-commerce website. It saves 5-6 hours of manual typing.</p>
        <h3 className="font-black text-[16px]">e) For Startup Founders & Product Managers</h3>
        <p>When you pitch to investor, you need demo data. Show your dashboard with 1000 fake users, orders, revenue. It looks real and impressive without using real customer data.</p>
        <h3 className="font-black text-[16px]">f) For Digital Marketers, Content Writers & SEO Experts</h3>
        <p>Marketers need dummy data for email testing, CRM testing, landing page testing. SEO experts need regional content for Bihar, UP, Tamil Nadu. Bhojpuri fake data helps to test regional apps.</p>
        <h3 className="font-black text-[16px]">g) For Teachers & Trainers</h3>
        <p>Teachers can generate data for Excel training, SQL training, Python Pandas training. Students can practice sorting, filtering, grouping on real-looking data.</p>
      </Sec>

      <Sec id="how-to-use" title="3. How To Use Fake Data Generator? Step-by-Step User Guide">
        <p>Using this tool is very easy. No login, no signup, no install. Follow these 5 steps:</p>
        <p><strong>Step 1 - Select Language:</strong> Top dropdown se language chuno. Example: For Bihar / UP app, choose Bhojpuri. For Tamil Nadu app, choose Tamil. For Global app, choose Chinese, Japanese, Spanish. Default is Bhojpuri.</p>
        <p><strong>Step 2 - Select Fields:</strong> Choose which fields you need. Options: Full Name, Email, Mobile, Address, City, Pincode, Company, PAN, Aadhaar, UPI ID. You can select 1 field or all 10 fields. For signup form testing, select Name + Email + Mobile. For address testing, select Address + City + Pincode.</p>
        <p><strong>Step 3 - Select Count:</strong> Slider se 1 se 500 tak records chuno. For quick test, choose 10. For load test, choose 500 or 1000. Click on Generate button.</p>
        <p><strong>Step 4 - Preview & Copy:</strong> Data table me dikhega. You can switch view - Table, JSON, CSV, TXT. Click Copy button to copy all data. Click Save to save in your browser.</p>
        <p><strong>Step 5 - Download:</strong> Click Download button. File will download in your selected format with UTF-8 support, so Hindi, Chinese, Japanese correctly open in Excel and Notepad.</p>
        <h3 className="font-black text-[16px]">Pro Tips for Best Testing</h3>
        <p>Tip 1: Always test with at least 100 records, not 5. Bugs hide in bulk data. Tip 2: Test with Bhojpuri, Tamil, Chinese together to check UTF-8. Tip 3: Use JSON for API, CSV for Excel, SQL for Database. Tip 4: Never use fake PAN, Aadhaar for real KYC - it is only for UI testing. Tip 5: For Figma, copy 10 names and paste in design.</p>
      </Sec>

      <Sec id="features" title="4. Key Features of Our Fake Data Generator">
        <p><strong>1. 20 Languages Support:</strong> Only tool in India with Bhojpuri plus global languages. Names are native and realistic, not translated by Google Translate.</p>
        <p><strong>2. 10 Fields:</strong> Full Name, Email, Mobile (Indian 10-digit starting with 9), Address, City, Pincode (6-digit), Company, PAN, Aadhaar, UPI ID.</p>
        <p><strong>3. 1 to 1000 Records:</strong> Generate bulk data in 1 second. No limit, no watermark.</p>
        <p><strong>4. 5 Export Formats:</strong> Table view, JSON for developers, CSV for Excel/Google Sheets, TXT for quick reading, SQL INSERT for database. All with UTF-8 BOM for Hindi/Chinese support.</p>
        <p><strong>5. 100% Free & No Login:</strong> No signup, no email, no payment, no ads popup. Open and use.</p>
        <p><strong>6. Privacy Safe:</strong> Data is generated in your browser only. We do not store your generated data on server. GDPR and DPDP safe.</p>
        <p><strong>7. Mobile Friendly:</strong> Works perfectly on Android, iPhone, Tablet, Desktop. Slider, buttons are mobile-optimized.</p>
        <p><strong>8. Valid Email Format:</strong> Email is always in English because email with Hindi/Chinese script is invalid worldwide as per RFC standard. We generate valid emails like amit.sharma1234@gmail.com, pooja.verma5678@yahoo.com.</p>
        <p><strong>9. Realistic Cities:</strong> For Bhojpuri - Patna, Ara, Ballia, Chhapra, Buxar, Siwan. For Hindi - Delhi, Mumbai, Jaipur, Lucknow. For Chinese - Beijing, Shanghai, Guangzhou, Shenzhen. For Japanese - Tokyo, Osaka, Kyoto.</p>
      </Sec>

      <Sec id="languages" title="5. 20 Languages - Full List With Examples">
        <p><strong>Indian Languages (11):</strong> Hindi - अमित शर्मा, Delhi | Bhojpuri - खेसारी लाल, Patna | Tamil - அர்ஜுன் குமார், Chennai | Telugu - రవి తేజ, Hyderabad | Marathi - साहिल जोशी, Pune | Bengali - অরিন্দম দাস, Kolkata | Gujarati - હાર્દિક પટેલ, Ahmedabad | Malayalam - മോഹൻലാൽ, Kochi | Kannada - ಯಶ್ ಗೌಡ, Bengaluru | Punjabi - ਜੱਸੀ ਗਿੱਲ, Ludhiana | Urdu - عمران خان, Karachi.</p>
        <p><strong>Global Languages (9):</strong> English - Aarav Mehta, Delhi | Spanish - Jose Garcia, Madrid | French - Pierre Dupont, Paris | German - Hans Muller, Berlin | Korean - 김민준, Seoul | Japanese - 田中太郎, Tokyo | Chinese - 张伟, Beijing | Russian - Иван Иванов, Moscow | Arabic - محمد أحمد, Dubai.</p>
        <p><strong>Why Bhojpuri is Special?</strong> Bhojpuri is spoken by 20+ crore people in Bihar, UP, Jharkhand, MP, Nepal. Most tools ignore Bhojpuri. We provide 20+ authentic Bhojpuri names like Pawan Singh, Akshara Singh, Nirahua, Amrapali Dubey, Manoj Tiwari, Kajal Raghwani. If you are building an app for Bihar/UP, you must test with Bhojpuri names, otherwise your app will feel foreign.</p>
        <p><strong>Why Chinese & Japanese Testing is Important?</strong> Chinese names have 2-3 characters, Japanese have Kanji + Hiragana. Many apps crash because database column is too small or not UTF-8. Test with 张伟, 王芳, 田中太郎, 佐藤花子 to check your app supports CJK characters.</p>
      </Sec>

      <Sec id="formats" title="6. Which Format Should You Choose? JSON vs CSV vs SQL vs TXT">
        <p><strong>JSON:</strong> Best for API developers, React, Node.js, Python, JavaScript. Example: [&#123; &quot;Full Name&quot;: &quot;Aarav Mehta&quot;, &quot;Email&quot;: &quot;aarav@gmail.com&quot; &#125;]. Use for Postman, frontend mock API.</p>
        <p><strong>CSV:</strong> Best for Excel, Google Sheets, Data Analysis, Pandas. Open directly in Excel. UTF-8 BOM ensures Hindi/Chinese correctly visible.</p>
        <p><strong>SQL:</strong> Best for MySQL, PostgreSQL, SQLite. Direct INSERT query - INSERT INTO users (name, email) VALUES ('Aarav Mehta', 'aarav@gmail.com'); Paste in phpMyAdmin and done.</p>
        <p><strong>TXT:</strong> Best for quick reading, WhatsApp sharing, Notepad, documentation.</p>
        <p><strong>Table View:</strong> Best for preview, screenshot, client demo, Figma copy-paste.</p>
      </Sec>

      <Sec id="lorempro" title="7. About Lorem Pro - Our Free Tools Platform">
        <p><strong>Lorem Pro</strong> is a free online tools platform made in India for developers, designers, students, content creators and small businesses. Our mission is simple - every useful tool should be free, fast, mobile-friendly and without login. Lorem Pro started with Lorem Ipsum Generator and now provides 20+ free tools like Fake Data Generator, Lorem Ipsum Generator, Password Generator, QR Code Generator, Word Counter, Case Converter, JSON Formatter, Color Picker, and many more.</p>
        <p>All Lorem Pro tools work in your browser, no data is stored on server, no signup required, and all tools are 100% free forever. We focus on Indian users - that is why our tools support Hindi, Bhojpuri, Tamil, Telugu and other Indian languages with proper native script. Whether you are a student in Patna, a developer in Bengaluru, a designer in Mumbai, or a startup founder in Delhi, Lorem Pro is made for you. Visit Lorem Pro homepage to explore all free tools and save your time every day. We update tools every week based on user feedback.</p>
      </Sec>

      <Sec id="safety" title="8. Is Fake Data Safe? Legal & Privacy Information">
        <p>Yes, fake data is 100% safe and legal for testing, learning, design and demo. It is not real personal data, so it does not violate GDPR, DPDP Act, or Privacy laws. You can safely use it in college projects, client demos, YouTube tutorials, blog posts.</p>
        <p><strong>Do NOT Use For:</strong> KYC, Bank Account Opening, Aadhaar Verification, PAN Verification, Government Forms, Fake Identity, Fraud, Scam, Fake Social Media Accounts. Fake PAN/Aadhaar in this tool are random numbers for UI testing only, they are not valid government IDs. Using fake ID for official work is illegal.</p>
        <p><strong>Privacy:</strong> We do not save your generated data. Data is generated using JavaScript in your browser. If you click Save, it saves only in your own browser localStorage, not on our server. You can delete anytime by clearing browser data.</p>
      </Sec>

      <Sec id="faq" title="9. Frequently Asked Questions - Fake Data Generator" openDefault={true}>
        <div className="space-y-2">
          <Faq openDefault={true} q="Is this fake data real? Can I use it for official work?" a="No, all data is 100% fake and randomly generated for testing only. Names, mobile numbers, Aadhaar, PAN are not real. Do not use for KYC, bank, or government work. It is only for developers, testers, and designers to test apps and websites safely." />
          <Faq q="How many languages are supported?" a="Total 20 languages - 11 Indian: Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Malayalam, Kannada, Punjabi, Urdu, Bhojpuri and 9 Global: English, Spanish, French, German, Korean, Japanese, Chinese, Russian, Arabic." />
          <Faq q="Why is Email always in English even when I select Hindi or Chinese?" a="Because email addresses with Hindi or Chinese script like अमित@gmail.com or 张伟@gmail.com are invalid worldwide. Email system only accepts English letters (RFC standard). So we always generate valid English emails like amit.sharma1234@gmail.com for all languages to ensure your testing does not fail." />
          <Faq q="Is this tool free? How many records can I generate?" a="Yes, 100% free with no login required. You can generate from 1 to 1000 records in one click. Select up to 10 fields like Name, Email, Mobile, Address, City, Company, PAN, Aadhaar, UPI ID and export in 5 formats." />
          <Faq q="In which formats can I download data?" a="5 formats: Table view for preview, JSON for API developers, CSV for Excel/Google Sheets, TXT for quick reading, SQL INSERT query for direct database import. All files support Hindi, Chinese, Japanese with UTF-8 BOM so they open correctly on mobile." />
          <Faq q="Can I use this for my college project or startup demo?" a="Yes, perfect for college projects, startup MVPs, UI design mockups, and client demos. You get realistic data without asking real users for their personal details, so it is GDPR safe." />
          <Faq q="Will my generated data be saved? Is it private?" a="Data is generated in your browser only. We do not store your data on server. Save button stores in your own browser localStorage. Your data is private to you." />
          <Faq q="What is the difference between Fake Data and Real Data?" a="Real data belongs to real people and is private. Fake data is randomly generated, looks real but belongs to no one. For testing, always use fake data to avoid privacy leak." />
          <Faq q="Can I generate Bhojpuri fake data for Bihar UP apps?" a="Yes, select Bhojpuri language. You will get names like खेसारी लाल, पवन सिंह, अक्षरा सिंह and cities like पटना, आरा, बलिया, छपरा. Perfect for testing Bihar UP apps." />
          <Faq q="Does this tool work on mobile?" a="Yes, 100% mobile friendly. Works on Android, iPhone, Tablet. You can generate, copy and download directly from mobile browser." />
        </div>
        <p className="pt-2">Related Keywords: fake data generator, dummy data generator, fake name generator, fake email generator, fake mobile number generator, fake address generator, test data generator, mock data generator, sample data generator, bhojpuri fake data, hindi fake name generator.</p>
      </Sec>

      <div className="mt-6 bg-zinc-900 text-white rounded-[24px] p-6 text-center">
        <h2 className="text-[20px] font-black">Generate Fake Data Now - 100% Free</h2>
        <p className="text-[13px] text-zinc-300 mt-2">Scroll up, select language, click Generate. No Login Needed.</p>
      </div>
    </div>
  );
}
