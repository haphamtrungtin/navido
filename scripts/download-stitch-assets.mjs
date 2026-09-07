import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(rootDirectory, 'public/images/stitch');

// Approved exports from Stitch project 11656008883608654946 only. They are
// temporary visual placeholders, never verified NAVIDO business photography.
export const stitchAssets = [
  [
    'home-cafe-interior.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDuG5oBGmYFN4KHcDhfssF15REC4CsuPeBkQYjjIclMpBqj8HCHcH4CzK66Hj9s6I2j4Mocc-2U1G9zxigLmBuhJZbB7bM1O2r-LC0mqlO8-aSGwPYN-0HboNicozROL7DhABDJejhf-KNbGgE2UvH2P4UTgnsFHDC8o1oCSwuFa3agyiRf6sjOawQS9gc_xIPiXpEjwgNae11qWVUuEKhGI58kntV12KFZ_an1neJcS1FH475jzOVRhw',
  ],
  [
    'home-morning-table.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA54nNEpasDFYJt4pn8BOY6PgjvqlpPg_yUf4O4XL0I8aA_W0I0Jn7HoSsc1DxxCj4c_aLqUxTDqaz06EwwH9CyFvvn6OCOFz_Alc_GJ2J7O-yOjKYTtF0lzpPNvxjEe06KdcN91V-eqz_I82Ha29cWMi-TuDUd52L0IJMtnmmUNEBl7aatG9YQOb4VdjmRiKzX6xr2b_Edr2udlCOKHsjetZDKF4TawQLVRzk9wqN8z_BrEXyhrXHrLg',
  ],
  [
    'home-pour-over.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBaBTKscGc47C_zdiB-uOtO8qVQZt1yaecUZIgIIfxmOocsh8C6zqYo5K-VT92dfAVIAQyA3nAl3EKbea7Dfvnd3Z0VWkYZsYJL6GbTR2GCdmQ1EfCZZmpv6a8lmDADiyaraPsfWo0dPQnBx9ScYdgJap1_x5PeMBHFLQ7-IwuK_-OhA_oyOwhh_kxnD9J3nriS0qjkE3CnDZ4OxO9lDHki5cHDYUl_vyPiVFsyr8K8TE-7cYR8kJPgHw',
  ],
  [
    'home-iced-latte.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBkd_93Ln-4ingmT2No8U6pOESALZHJu50zqCj3RGzp5vUbfXs6re4HBjTlXe1YhcoJOM19vQQjQZ6WCA1Qglud33iDddkaAE7MYPoNIFut6_nai8IdqBavbO0sQO5pLEmYEIwWk0sShuXH5M0mVb1-lhRY068lFIeY_CU1iN5hPOD_rTZq2K-a_Lxr64bwdzxPetF9Gl1qBs8WTnc1pcBmmmabYWhHvz84kXUwiGFK1aUL5iUD0GPQzQ',
  ],
  [
    'home-espresso.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCHeJTsbRARa-q7eEV8_ZMB25Y2Ig1oGofJtivV8buoGo2XYbeJe-sn0c08t0UQTtffydPgUYkvTFFccEl8aDaT9i0Quhsfi5qQl7Q1grETU9-7LiY02mqw4Sf6QG0u_zvazoCeH7cOFYkE9EhouQgVaJzv6pznJa_O87XHx8yzN40wCpCNn_kiFPREVbpki5vPhGwQoIoMK4jKU53zzT5Eog1Xc2gA9IWXwyXq7I__rV4PWDit1-AgXQ',
  ],
  [
    'menu-editorial-counter.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDB-eraS4RdUqMcUXIsGrWmyVuEuoyEJWaz9X1t51_caL4WUfW-PRsk-pQEFRzGNlqwBNdCiCtrzWFFiP-LYdoFS32_Fgrq0JojKOM-3Oheaaj7XvxUFbM4H-sHfoe5mm-Vu4qKH52j7084IvhBhy8yXINsjISfMJTWaHWb3uif7Pt_U6iW3_S1oJus4Q8-F0tZCR5zjH7fZZC2S2W8PwRQD8bpGei_GbdIpZYAKuncDPPXqplAFdribg',
  ],
  [
    'menu-editorial-avocado.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCyIM1SzmVH27dQVs1kCNQ5k-sn3CiHUPBeBZ_Lx_L7psT8gKtwytgyfOIY_Ph9nUv5puswKCtVFzloP9Gkr-GL-TAtmG4fIrT-PSe5pPz27SAD3jh0XOHS1BRlan1rEFCDWCUSW3T3rJdyQcTq2ipVKFXPF5Pog3niPsgG5o17rRCj5zEwJmWLKLBGi8rIN1RMNO09Kwtra3_ImuwyyWsjom0XCG7Z42JiDQkyKGCyZERH_8VrhU7_jw',
  ],
  [
    'menu-editorial-phin.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB9rhV6EYpheKrYKp2QJY6P5-bBxH0IAGVDCTAt35GtE48PtEeViUMCc19wrByrz_64Sj9fumRQhDg4NadgijgmfmvmliY49rB9dgx1sPGo4KRg_tahgHBVULX7VcwIWEeC3NfaMr3yQJ7oK-TtqbhmNiBuH9pqWmdT5N2P9WgnVEdBxGEA5J54mQsTPCfohn6EnpZJouFX98tGe8q7AJYktoDLB3PeN5EqBmAWxL__mbFFuOQpQEQWXw',
  ],
  [
    'menu-editorial-avocado-detail.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCUOFCT7sM8AnTcEQqltNsrS1Gosmi5HsQb0l_q0riPrMgKiaURYAKe5CxEq-eRjnAtcqaaIgj8I6Uu9ioMm1a8bTa9_AAIqlc1TkYJubg6SEdDvpE6gElddlYEqSmspJy9LBi1zPcrbO2STGMuGnap6d2aFFNyIhpi4QBlnDw3ZS0H9vN4eGvWiKsWM1XLyyjx63-gbvzH0VRMz2TkU9kum1mej9y_4-AsOxuau_Q9qLF195ylPOwOLw',
  ],
  [
    'menu-editorial-table.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBSP5FsGdDHVBBhyeh93o9p0vRxXMoml7LxIGCKndJ7w9A7A7FDTztxnLMnuu0xIXFMrh1oYPJbnZWlWZngcYG0oVGlz-0pV0iBVaUaUezoYbrztcr5hw57gR3i1Fy-_pNHRyNbs9m52ias3DGRSym6Wt6Vmm0tu3CAIBJjVC7aTpPvnESzQsNtSPlxOT5IQLbpF0QsnZiSlmNKST2FGlSd58pWzeSmDyW50ld4SntTgCdbV_i4dwNu6Q',
  ],
  [
    'menu-editorial-pour-over.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB4ZlFjrUVgPICSxO4TXKh457za1xdDbT2FmFFS9IhI3QJjfyepDEFFstrfTRu5qXts9ADwdLg_4xgNqSyG72tp0XxY_zEIrKS1knWBA9cpQpvgoFPJVFRBljWw8MwMSW1rCO40IbNQY7XB3F-tB4_BX75-ORU8FeWI2JZ8qpmAdCprrvwMLM1VDXUOEOzMLZVqhjTz-pdUQi8slLctnkIQPLWzFypiqJC7Ip7I8-EGn1ob2CCcANfGbg',
  ],
  [
    'menu-editorial-pastries.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD4pzoL5bIwzgOvK3m9sTzdz60VoLOi2KbYa5hc1YmZnew6To-2vFbXhfhZT8PLlFYClY6KpCYHQWJQdrdTlhkf4AxZjNtXrKrVwUHGWav_vTOJmM175iJ4kfPuqjOqPY_OiTpmAbdVDKeb6_P3CUyh52EBY5GsHyjrd4HlzuyK1g91TZc-ieoI0nHVhjdmi4hO6gxCnDT_A_phC13wF2IzDp82H0jc3hQoaLrd4eDTq0fBt--0mQCZcA',
  ],
  [
    'menu-editorial-brunch.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAyjR2xgAKdunBopjVs1Oez_c9o19zOlA2cKhdnKJcLfBqaKZLHPTEb1FHad_Rq0lMD3Ye5yatVhNRyMByLK1jRMOWLrRU9qnUInQ1cCZzTxg-13FA1j23Qj74kiwNNBvfr3tixWVY4r5k32DgWXV-F3UhC9gewz1par5drZ0DGC8KQs57MsTsm3WTk1GGg5DCn4N3PLQeu78NJSYFPkDTb0m-Sufob-zHJ5ZlVSYKYbORyOY3bslu4sw',
  ],
  [
    'menu-editorial-avocado-mobile.jpg',
    'https://lh3.googleusercontent.com/aida/AEtjO1Xxzhswo4JcDuSWgqx8TjrTVWMpA9uY2oTGTcs84NB5NtFhkS0OgIi6UxjJr_rpabTQcN79d2YYQQDYrv0e2tcMLXwcTyRyLqgTrM_1oXzVXVuoxb5ZxRCjB8Q4Xg3jDN9mnz0UHoi356xEVnWZUhE5LgMqPrgvxxqeov7379leHVPn0DLa9RabS3SfG7td2xgSEz4XWhJY-cNOdtU-p9nkGKkcu3tRiVFjiwf9Q8omYrfWXO8izhSE0zs',
  ],
  [
    'menu-editorial-pour-over-mobile.jpg',
    'https://lh3.googleusercontent.com/aida/AEtjO1UQfnB6dwgNbEWBo2lGtmBPxuPWsNv7RYDM3EUTK8uF8IfpiauRwFYSxNFIS1WLQKZSy8Gsej689MRQ9qE6zoDibt4uC0lUqQtOPj0OX1JgpI94F0CQuQYdXhFStt-29xPoUi_7weqFWjEiT-vtjbGXHnZ9f0vW84W4aOAzN-Y2W1V59yoUxY1ssAO6TZ4HYsXkpRm1lUhdh3taaRn8r-Hv_Kq-5utHsLG2qL9L83XhnLCLeTPVeF4tk_g',
  ],
  [
    'menu-editorial-brunch-mobile.jpg',
    'https://lh3.googleusercontent.com/aida/AEtjO1U3F5uNSXh6uYNjzyU603swCf8oyHj4XsKaRGCbuqOknIGPB7iAJm_lWKuPBHBP5RvtlTxTbGg9aBBV7L-aXkSfQ2CFWYRBMW7B1KYQG134izuzdx5p7AvQ7cm86_rktcnH8hTZHH3HP_MJZJuJXG9WkmmiBo8bt7E2CfrbcNZ2-HpMm1hgArpj3I1io1ok-LJneRtIVlh0mvtA0SCOuLquqqY-m3DkUnqpaj0OgCp-A4E-4GODs4kTkPuj',
  ],
  [
    'space-interior-morning.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBi6gQ3BHJ065Sd-jfiGQ9dTmZXckK1BMzBS9LwJ_hMC6_GboizrXekyR3vZSO8b6zLx5qLikoq6nmmI1sc85OttX_IpNCqExq-0cGNx4w-EMrT_9-ZsUl723PIvQctGuFO-Pt-OJFqdZCWKOkhMCyPIup1wdpu1lN0I4lIg84Dg2Wt-_BbNosA1I13p6pcQQFfOwALsI830cNsF0W7jmTmXOa1CciHPXgS1uiiEs8ySDemfj6jdC2XRg',
  ],
  [
    'space-morning-light.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC95stO_jIpz_IXPnvD5GwfGPHLty2e-qVF_NrsQj4fj4ccocmah_KiEQUQWV3fs0n2FwiO1VTdWMzt7xUzqzrgeG4vGVUVI8OoOBcOuTYZpe50fxMO0E69BTDIPLoS77QGE1Jdvq6d5wuvyuu96TCaapkHE1Lw7IxVRE1yFiEq4IKYNG-TncYebR6V76u18U1U08ntzLjJe9BsIYgJDFe9sJbazm6-iy4xkmJpYH5T2xqSDmm_DJit0g',
  ],
  [
    'space-quiet-table.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBoVhKaViwcdFzofHAViv4ZCmFQ3JENLDIHkj8CGrBirsCTy62PUHhuMsz9wS5KPzLrE0yiR_Zzk_99eImzOMfw8aXJlCiCNokV_sQcbH1UlBihFPKUs0Q8DZPWN3j1YZu6XvTKXG_Ilx1kOD0sJ8mqimHYqGPpDHVLYJmRmbjuyyajV7rOasAV3XH4TWtSsxV4WWSVyfjIYK9KMHx_9kiTW4kx9k5wrdoNjWO_9kEfaX51XirBcfRUqg',
  ],
  [
    'space-downstairs.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAO1CxUsedY8-KUiZaGjG9o6sgwEhuZDyjpWAtiu4bimguIQtEM8PgxrnV1N2L6UloGlUnm_lUDu2LjlLMBQdadmgz_3wYDL9aG_hEx6m5Zu9vq38WSLHwxaoTfJTAcIE8jsXhwCqhqNcl8jOrDV0CngbHRMgTgRwsASpYT-zXhgPWeTFdWOa6R8Q79SfJlYTaoNP90MOFV6dhDzu5clAOpiytiXbmSEC0HhLbcVjP7aZNVxFINiwld0w',
  ],
  [
    'space-upstairs.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBmSCxTkaqzTNsi3l04SGpJqUq4tUI1q7ykKLFjfZ_QZcVXiqIjUZQXidTWeFIaBJiPGh2y6gPkZxA3pb9OnBUV7Wh1pW7U3tmTwsKvRD6g8E6rcMQA0SLXQi5hNRXARSqPwFg1eS2EOSK5KEYsOlLLk-dGkM6mlYE6ad6rnE2Rhx7n2XZi7AT4fUBWpzh5f7j4HH2bAHcxRD2whKyUaiWBly2H0Hj-rkxWiSBNdAJGQwxEEi46b2WBMQ',
  ],
  [
    'about-pour-over.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA3k-Bs-lxN7U3h1IS-a5MniI5meYJ_sPvp2Hl3rHtcYQQ_thLlXq0sI3_V0Kph7qyfIvyvZaGaJnTEVYZlkjQRjYQTOjcabLu-mK-CRUKXjoJ6tqjgqSDmhuyazcep9LQVNF7wLlMX1yLqRIBfDIElSC6BpUvkp8HaB5OSPFj-2jS4kejOs1VcAeOQeCoq6bnDGI8RPUNGmGsWNG-LoVT5uwcVocm0ExLaxbNKbhNTFZT7chOeMQEUkw',
  ],
  [
    'about-pastry.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA1jGhlDFc2UvRNd6WPPq8qOSv70cimCUHv_y8gDy5bfn5eDcMJutS-hLydWbp75mCOIkKqL_A9T8FdYLx5dt4cfkYesf3qytfmqpw-otucGwyhZC8DCjKKCFciFt3JBuMsNTEUDlTEzymAAEa_vyEnzOQN3prgugOLQcsZDIcGJUUyoRrZhSBOfuJGl8PqYm0u14m5jsNOOZuXJkpz9yQRVt57dimZ2_M81qaaqCn_MYNfxQlProhtsA',
  ],
  [
    'about-space.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuASvfmFFGpiJoi3Hn_OAHNKv8H64m2xNotm9OMf4Cqrowx1iuLRCrsUNUl4116FXUSXP4uF-sAuEjwPpC7kq4O7JWZkX9SMXxyy_-ld_kJo_0d05fbtqTa_DQnX4o45Lezim9JbQ1fNWbAtynga6zlkXA4wNIh2BjeQcJHeBdvr1Ob0zZSkpvLTIbMLH4rmpanHE5asuO5lgidlm02Qk5okc7R-1Qo5xBSs6c6fJ_oY6lzcqtdWs_9TsQ',
  ],
  [
    'about-community.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCT7FTaP9AAmLqwpBLiBPBZI0yPPZwlV4BwAPGlWb-Ef2Z-AnVfCS0vB5wl1VQCyxeKkmFulaHl2SFRC3Ag02VuEV3FwkNeWwxKlVr1O9QZepDNbZjn5gfTidIs6V4WDN_8oq3uh5qUrC4CqEn4xHaGiwWbZsXpRYSoa-rZPH2XrzvAlqUkY_45OfdtkiNL7roORebgKJJPN_MRGV1w2tgeRi-8tJsUEavBCbJkavs5OtO-4fnmH7xULQ',
  ],
  [
    'about-street.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCns2QbscZI7CNR3ns3vs5f28YmPuL2q1EmpgO5zoJkt9UcfXBeRfchIYmoqPh1reEhiTUxrcFKEsE5ck5dKFGEoN0JEz-gjXwhWt9Vs65WlpCj2m8pVzcFY-Qa2Dz2N9SEaN2gEmbY_6zi9-WCGNzwcHFN0gl7mRSG1csrB0MpMZIfphO8uikT7B8cTNSC534YeptMUaznl9SsglR4CZfV4TxGtMl2hphdSu9Bhi-WdmcKN1cfZcwlDQ',
  ],
  [
    'visit-exterior.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCopCrrogsDRAlZcGFNgL5TDBhn7LfupJrFdc8NXGUsEPSp_ySmAiJ2ceZQ6Y2AiQveoJZPolzszHnsBBaNdvLoLQZ3D5VLQPoirC_BG0PuioS5T6rCs6MhzvGocgxLs40Yct_MYsWci4ox51yMAl1uZPfpbESaoXPt7Ebbcfv9yhuBjpUfkeAk-9nJOhikAej6ULLSNL8AoZ0KQUhX1vMZcflRESOW1V-iL4eLrvmjdR2a9f8mb_rRsQ',
  ],
  [
    'visit-map-placeholder.jpg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCC4AwCrEhBBMuARu1_D2vNoT3uC8zwBuVnF0-124blUxH5BcHc2XsaByENiwjl2UdNNnF-Jdo8iqBisSnXzgo1ezw78pQS5IN_AFa1_XR_6cen-5HJvdPUVxy_uMR7Q44H2gcekaR_g8yXtv_KXM0g9-JHXTSRHfmf4XVv2MOBMVq-8S717OmwlLZiXbn0cmLuy8Ulosd2FRSyVHSLK1PmZioXGoSezh2qDAgYVBypQ7CFQeh-dkysrA',
  ],
].map(([filename, url]) => ({ filename, url }));

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  resolve(outputDirectory, 'manifest.json'),
  `${JSON.stringify(stitchAssets, null, 2)}\n`,
  'utf8',
);

const failures = [];
for (const asset of stitchAssets) {
  try {
    const response = await fetch(asset.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await writeFile(
      resolve(outputDirectory, asset.filename),
      Buffer.from(await response.arrayBuffer()),
    );
    console.log(`Downloaded ${asset.filename}`);
  } catch (error) {
    failures.push(
      `${asset.filename}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

if (failures.length) {
  console.warn(
    'Some assets were unavailable; manifest.json remains a reproducible fallback.',
  );
  for (const failure of failures) console.warn(`- ${failure}`);
}
