const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://org.devfolio.co/infinity-hacks/review?status=submit');

  console.log('Browser opened.');
  console.log('ACTION REQUIRED: Log in, filter to "Submitted", AND CLICK ON THE FIRST APPLICANT so the review card is open.');
  console.log('The script will wait 65 seconds for you to prepare...');
  
  await page.waitForTimeout(65000); 

  const teamsToProcess = 150; // Set the number of teams to process.   
  console.log('Starting automation loop...');

  for (let i = 0; i < teamsToProcess; i++) {
    console.log(`Processing team ${i + 1} of ${teamsToProcess}...`);
    
    try {
      // Wait 2 seconds for the card to fully load
      await page.waitForTimeout(2000);

      // NEW SAFETY CHECK: Look for the 'Accept team' button instead of 'SUBMITTED' text
      const canAccept = await page.getByRole('button', { name: 'Accept team', exact: true }).isVisible();
      
      if (!canAccept) {
        console.log(`Team ${i + 1} cannot be accepted (button missing). Skipping...`);
        
        // Use the right arrow key to skip to the next team
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(1000);
        continue; 
      }

      // 3. Click "Accept team"
      await page.getByRole('button', { name: 'Accept team', exact: true }).click();
      await page.waitForTimeout(1000); 

      // 4. Click "Send acceptance mail"
      await page.getByRole('button', { name: 'Send acceptance mail', exact: true }).click();
      await page.waitForTimeout(1000);

      // 5. Click "Send Mail" on the popup modal
      await page.getByRole('button', { name: 'Send Mail', exact: true }).click();
      
      // Wait for the network request to finish sending the email
      await page.waitForTimeout(3500); 

      // 6. Press the right arrow key to go to the next application
      await page.keyboard.press('ArrowRight');
      
      // Give the new application a moment to load before the loop restarts
      await page.waitForTimeout(1000); 

    } catch (error) {
      console.error(`Script stopped at team ${i + 1}. Error:`, error.message);
      break; 
    }
  }

  console.log('Automation run finished!');
  await browser.close();
})();