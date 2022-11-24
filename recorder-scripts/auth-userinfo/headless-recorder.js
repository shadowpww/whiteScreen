module.exports.play = async (page) => {
  await page.waitForSelector('#input_select_date_begin');
  await page.click('#input_select_date_begin');

  await page.waitForSelector('#mod_sidecombo_div_date_begin_ok');
  await page.click('#mod_sidecombo_div_date_begin_ok');

  await page.waitForSelector('#input_select_date_exp');
  await page.click('#input_select_date_exp');

  await page.waitForSelector('#mod_sidecombo_div_date_exp_ok');
  await page.click('#mod_sidecombo_div_date_exp_ok');

  await page.waitForSelector('#input_mobile');
  await page.click('#input_mobile');

  await page.waitForSelector('#input_select_address');
  await page.click('#input_select_address');
};
