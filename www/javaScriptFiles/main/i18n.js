const TRANSLATIONS = {
  en: {
    'settings.title': 'Settings',
    'settings.music': 'Music',
    'settings.audio': 'Audio',
    'settings.language': 'Language',
    'settings.audioVolume': 'Audio Volume',
    'settings.musicVolume': 'Music Volume',

    'profile.name': 'Profile Name:',
    'profile.daysPlayed': 'Days Played:',
    'profile.changeName': 'Change Name',
    'profile.icon': 'Profile Icon',
    'profile.account': 'Account',
    'main.title': 'Main Lobby',

    'map.title': 'LEVELS',
    'loadout.title': 'LOADOUT',
    'inventory.title': 'INVENTORY',
    'social.title': 'JOIN THE COMMUNITY',
    'home.battle': 'BATTLE',

    'nav.shop': 'Shop',
    'nav.loadout': 'Loadout',
    'nav.battle': 'Battle!',
    'nav.inventory': 'Inventory',

    'ui.free': 'FREE',
    'ui.owned': 'OWNED',
    'ui.buy': 'BUY',
    'ui.get': 'GET',
    'ui.claim': 'CLAIM',
    'ui.claimed': 'CLAIMED',
    'ui.equip': 'EQUIP',
    'ui.equipped': 'EQUIPPED',
    'ui.locked': 'LOCKED',
    'ui.open': 'OPEN',
    'ui.close': 'CLOSE',
    'ui.cancel': 'CANCEL',
    'ui.item': 'Item',
    'ui.desc': 'Description',
    'ui.weapon': 'WEAPON',
    'ui.price': 'PRICE',
    'ui.rarity': 'RARITY',
    'rarity.COMMON': 'COMMON',
    'rarity.RARE': 'RARE',
    'rarity.EPIC': 'EPIC',
    'rarity.LEGENDARY': 'LEGENDARY',
    'ui.role': 'ROLE:',
    'ui.ability': 'ABILITY:',
    'ui.stats': 'STATS',
    'ui.shop': 'SHOP',
    'ui.goToShop': 'GO TO SHOP',
    'ui.goToSuperShop': 'GO TO SUPER SHOP',
    'ui.goToLoadout': 'GO TO LOADOUT',
    'ui.comingSoon': 'Coming Soon...',
    'ui.yes': 'Yes',

    'toast.noCoins': 'Not enough coins!',
    'toast.alreadyOwned': 'Already owned!',
    'toast.boughtEquipped': 'You bought and equipped {name}!',
    'toast.superPurchased': 'Super purchased and equipped!',
    'toast.superUnlocked': 'Super unlocked and equipped!',

    'shop.title': 'SHOP',
    'shop.sub': 'Grab deals • Upgrade style • Power up',
    'shop.dailyOffers': 'DAILY OFFERS',
    'shop.freeGift': 'DAILY BONUS',
    'shop.skinOffers': 'SKIN OFFERS',
    'shop.featured': 'FEATURED',
    'shop.coins': 'COINS',
    'shop.refreshesDaily': 'Refreshes daily',
    'shop.everyDay': 'Every day',
    'shop.limited': 'Limited',
    'shop.bestValue': 'Best value packs',
    'shop.featuredTag': 'SPECIAL DROP',
    'shop.newFeaturedIn': 'NEW FEATURED IN {time}',
    'shop.notEnoughCoins': 'Not enough coins',
    'shop.skinPurchased': 'Skin purchased!',
    'shop.featuredUnlocked': 'Featured unlocked!',
    'shop.dealPurchased': 'Deal purchased!',
    'shop.alreadyOwnedBonus': 'Already owned. Bonus: +{coins} coins',
    'shop.dailyGiftCoins': 'Daily gift: +{coins} coins',
    'shop.boostUnlocked': 'Boost unlocked: {name}',
    'shop.unlocked': 'Unlocked: {name}',
    'shop.confirmSuper': 'Are you sure you want to buy this super?',
    'shop.dailyGiftClaimed': 'Daily gift claimed! +{coins} coins',
    'shop.coinClaimed': '+{coins} coins!',
    'shop.paymentUnavailable': 'Payment is not connected yet.',

    'shop.gift.title': 'Daily Gift',
    'shop.gift.tag': 'DAILY',
    'shop.gift.freeCoinsToday': 'Free coins for today',
    'shop.gift.unlockBoost': 'Unlock a boost item',
    'shop.gift.unlockDaily': 'Unlock a daily shop item',
    'shop.gift.claimYourReward': 'Claim your reward',
    'shop.gift.dailyGift': 'Daily Gift',
    'shop.gift.paidCoinsOnly': 'Coin packs require payment.',

    'loadout.weapons': 'Weapons',
    'loadout.pets': 'Pets',
    'loadout.super': 'Super',
    'loadout.upgrade': 'Upgrade',

    'planet.levelRange': 'Levels {start} - {end}',

    'weapon.laser.name': 'Laser',
    'weapon.laser.desc': 'Fast shots with a high fire rate.',
    'weapon.missile.name': 'Missile',
    'weapon.missile.desc': 'Heavy projectile with strong impact.',
    'weapon.triangleShooter.name': 'Triangle Shooter',
    'weapon.triangleShooter.desc': 'Wide spread shots for crowd control.',
    'weapon.statsComingSoon': 'Stats coming soon.',
    'weapon.descComingSoon': 'Weapon description coming soon.',

    'pets.title': 'PET SHOP',
    'pets.equip': 'EQUIP',
    'pets.unequip': 'UNEQUIP',
    'pets.supportCompanion': 'Support companion',
    'pets.info': '{name} Info',
    'pets.role.attack': 'ATTACK',
    'pets.ability.heavyPulse': 'Heavy Pulse',
    'pets.ability.mindControl': 'Mind Control',
    'pets.ability.massCrash': 'Mass Crash',
    'pets.effect.siren': 'Let them do the work.',
    'pets.rate.every8s': 'Every 8s',
    'pets.rate.every9s': 'Every 9s',
    'pets.stat.LIVES': 'Lives',
    'pets.stat.DAMAGE': 'Damage',
    'pets.stat.SHOOT_RATE': 'Shoot Rate',
    'pets.stat.ABILITY': 'Ability',
    'pets.stat.EFFECT': 'Effect',
    'pets.stat.RATE': 'Rate',
    'pets.dog.short': 'Support companion',
    'pets.dog.long':
      'Chimpo is an autonomous companion unit that assists the player in battle.\n\n' +
      'It automatically targets the closest enemy and fires consistently over time. ' +
      'Perfect for early-game support and survivability.',
    'pets.siren.short': 'Support companion',
    'pets.siren.long':
      'Siren does not deal damage directly.\n\n' +
      'It manipulates enemy minds, forcing them to turn against each other.\n' +
      'Extremely effective in crowded waves.',

    'super.waveShield.title': 'WAVE SHIELD',
    'super.waveShield.desc':
      'Generates a powerful energy wave that blocks incoming damage and reflects part of it back to enemies.',
    'super.superLaser.title': 'SUPER LASER',
    'super.superLaser.desc':
      'Channels a long-range laser beam that deals high damage over time.',
    'super.stat.Duration': 'Duration',
    'super.stat.Cooldown': 'Cooldown',
    'super.stat.Reflect': 'Reflect',
    'super.stat.Damage': 'Damage',
    'super.stat.Pierce': 'Pierce',

    'inv.section.weapons.title': 'Weapons',
    'inv.section.weapons.sub': 'Your unlocked weapons',
    'inv.section.pets.title': 'Pets',
    'inv.section.pets.sub': 'Companions & helpers',
    'inv.section.skins.title': 'Skins',
    'inv.section.skins.sub': 'Cosmetics you own',
    'inv.section.supers.title': 'Supers',
    'inv.section.supers.sub': 'Special abilities',
    'inv.modal.skins': 'SKINS',
    'inv.modal.weapons': 'WEAPONS',
    'inv.modal.pets': 'PETS',
    'inv.modal.supers': 'SUPERS',
    'inv.empty.skins': 'No skins',
    'inv.empty.weapons': 'No weapons yet',
    'inv.empty.pets': 'No pets yet',
    'inv.empty.supers': 'No supers yet',
    'inv.notOwned': 'NOT OWNED',
    'inv.available': 'AVAILABLE',
    'inv.goToPetShop': 'GO TO PET SHOP',

    'game.title': 'The Game',
    'game.victory': 'Victory!',
    'game.gameOver': 'Game Over!',
    'game.reward': 'You earned {coins} coins',
    'game.betterLuck': 'Better luck next time!',
    'game.nextLevel': 'Next Level',
    'game.backToLobby': 'Back to Lobby',
    'game.lobby': 'Lobby',
    'game.tryAgain': 'Try Again',
    'game.newSkinUnlocked': 'NEW SKIN UNLOCKED',
    'game.collect': 'COLLECT',
    'game.lockedLevel': 'Level {level} is locked!\nComplete previous levels first.',
    'game.lives': 'Lives:',
    'game.level': 'LEVEL {level}',
    'game.levelColon': 'LEVEL {level}:',
    'game.stage.100.title': 'LEVEL 100:',
    'game.stage.90.title': 'LEVEL 90: STORM CORE',
    'game.stage.80.title': 'LEVEL 80: WAVE WALL',
    'game.stage.70.title': 'LEVEL 70: MAGNETIC CHAOS',
    'game.stage.60.title': 'LEVEL 60: LASER LOCK',
    'game.stage.100.1': 'This is the final stage... and the rules are about to change.',
    'game.stage.100.2': 'No Anglers this time.',
    'game.stage.100.3': 'You will face every boss... and then the final one will appear.',
    'game.stage.100.4': 'After each boss falls, you will earn an upgrade.',
    'game.stage.100.5': 'Survive the full gauntlet to clear the level.',
    'game.stage.100.6': 'Complete this stage to unlock an exclusive skin you cannot get anywhere else.',
    'game.stage.90.1': 'Boss10 controls lightning strikes and electric zones.',
    'game.stage.90.2': 'Keep moving and avoid marked danger areas.',
    'game.stage.80.1': 'Boss9 creates wave walls with narrow safe gaps.',
    'game.stage.80.2': 'Read the telegraph and move early.',
    'game.stage.default.1': 'Get ready.',
    'game.stage.default.2': 'Survive the stage and defeat everything in your path.',
    'game.enterChaos': 'ENTER THE CHAOS!',

    'upgrade.doubleShooter.title': 'Double Shot',
    'upgrade.doubleShooter.sub': '+1 Projectile',
    'upgrade.plusHp.title': 'Extra HP',
    'upgrade.plusHp.sub': '+1 Life',
    'upgrade.fasterShooter.title': 'Faster Fire',
    'upgrade.fasterShooter.sub': 'Rate Boost',
    'upgrade.petFaster.title': 'Pet',
    'upgrade.petFaster.sub': 'Faster',
    'upgrade.damageUp.title': 'Damage Up',
    'upgrade.damageUp.sub': '+1 Damage',
    'upgrade.speedBoost.title': 'Speed Boost',
    'upgrade.speedBoost.sub': '+Move Speed',
    'upgrade.piercingShot.title': 'Piercing Shot',
    'upgrade.piercingShot.sub': 'Shots Go Through',
    'upgrade.superCharge.title': 'Super Charge',
    'upgrade.superCharge.sub': '+Gauge Energy',
    'upgrade.shield.title': 'Shield',
    'upgrade.shield.sub': '20s Protection',
  },

  he: {
    'settings.title': 'הגדרות',
    'settings.music': 'מוזיקה',
    'settings.audio': 'צלילים',
    'settings.language': 'שפה',
    'settings.audioVolume': 'עוצמת צלילים',
    'settings.musicVolume': 'עוצמת מוזיקה',

    'profile.name': 'שם פרופיל:',
    'profile.daysPlayed': 'ימים ששוחקו:',
    'profile.changeName': 'שנה שם',
    'profile.icon': 'אייקון פרופיל',
    'profile.account': 'חשבון',
    'main.title': 'לובי ראשי',

    'map.title': 'שלבים',
    'loadout.title': 'ציוד',
    'inventory.title': 'מלאי',
    'social.title': 'הצטרפו לקהילה',
    'home.battle': 'קרב',

    'nav.shop': 'חנות',
    'nav.loadout': 'ציוד',
    'nav.battle': 'קרב!',
    'nav.inventory': 'מלאי',

    'ui.free': 'חינם',
    'ui.owned': 'בבעלותך',
    'ui.buy': 'קנה',
    'ui.get': 'קבל',
    'ui.claim': 'אסוף',
    'ui.claimed': 'נאסף',
    'ui.equip': 'צייד',
    'ui.equipped': 'מצויד',
    'ui.locked': 'נעול',
    'ui.open': 'פתח',
    'ui.close': 'סגור',
    'ui.cancel': 'בטל',
    'ui.item': 'פריט',
    'ui.desc': 'תיאור',
    'ui.weapon': 'נשק',
    'ui.price': 'מחיר',
    'ui.rarity': 'נדירות',
    'rarity.COMMON': 'קומון',
    'rarity.RARE': 'רייר',
    'rarity.EPIC': 'אפיק',
    'rarity.LEGENDARY': 'לג׳נדרי',
    'ui.role': 'תפקיד:',
    'ui.ability': 'יכולת:',
    'ui.stats': 'נתונים',
    'ui.shop': 'חנות',
    'ui.goToShop': 'עבור לחנות',
    'ui.goToSuperShop': 'עבור לחנות הסופר',
    'ui.goToLoadout': 'עבור לציוד',
    'ui.comingSoon': 'בקרוב...',
    'ui.yes': 'כן',

    'toast.noCoins': 'אין מספיק מטבעות!',
    'toast.alreadyOwned': 'כבר בבעלותך!',
    'toast.boughtEquipped': 'קנית וציידת את {name}!',
    'toast.superPurchased': 'הסופר נקנה וצויד!',
    'toast.superUnlocked': 'הסופר נפתח וצויד!',

    'shop.title': 'חנות',
    'shop.sub': 'דילים • סטייל • שדרוג כוח',
    'shop.dailyOffers': 'הצעות יומיות',
    'shop.freeGift': 'בונוס יומי',
    'shop.skinOffers': 'סקינים',
    'shop.featured': 'מומלץ',
    'shop.coins': 'מטבעות',
    'shop.refreshesDaily': 'מתחדש כל יום',
    'shop.everyDay': 'כל יום',
    'shop.limited': 'מוגבל',
    'shop.bestValue': 'החבילות המשתלמות',
    'shop.featuredTag': 'דרופ מיוחד',
    'shop.newFeaturedIn': 'מומלץ חדש בעוד {time}',
    'shop.notEnoughCoins': 'אין מספיק מטבעות',
    'shop.skinPurchased': 'הסקין נקנה!',
    'shop.featuredUnlocked': 'המומלץ נפתח!',
    'shop.dealPurchased': 'הדיל נקנה!',
    'shop.alreadyOwnedBonus': 'כבר בבעלותך. בונוס: +{coins} מטבעות',
    'shop.dailyGiftCoins': 'מתנה יומית: +{coins} מטבעות',
    'shop.boostUnlocked': 'בוסט נפתח: {name}',
    'shop.unlocked': 'נפתח: {name}',
    'shop.confirmSuper': 'בטוח שברצונך לקנות את הסופר הזה?',
    'shop.dailyGiftClaimed': 'המתנה היומית נאספה! +{coins} מטבעות',
    'shop.coinClaimed': '+{coins} מטבעות!',
    'shop.paymentUnavailable': 'התשלום עדיין לא מחובר.',

    'shop.gift.title': 'מתנה יומית',
    'shop.gift.tag': 'יומי',
    'shop.gift.freeCoinsToday': 'מטבעות חינם להיום',
    'shop.gift.unlockBoost': 'פתח פריט בוסט',
    'shop.gift.unlockDaily': 'פתח פריט יומי מהחנות',
    'shop.gift.claimYourReward': 'אסוף את הפרס שלך',
    'shop.gift.dailyGift': 'מתנה יומית',
    'shop.gift.paidCoinsOnly': 'חבילות מטבעות דורשות תשלום.',

    'loadout.weapons': 'נשקים',
    'loadout.pets': 'חיות',
    'loadout.super': 'סופר',
    'loadout.upgrade': 'שדרוג',

    'planet.levelRange': 'שלבים {start} - {end}',

    'weapon.laser.name': 'לייזר',
    'weapon.laser.desc': 'יריות מהירות בקצב אש גבוה.',
    'weapon.missile.name': 'טיל',
    'weapon.missile.desc': 'קליע כבד עם פגיעה חזקה.',
    'weapon.triangleShooter.name': 'יורה משולש',
    'weapon.triangleShooter.desc': 'יריות רחבות לשליטה בקבוצות אויבים.',
    'weapon.statsComingSoon': 'נתונים יתווספו בקרוב.',
    'weapon.descComingSoon': 'תיאור נשק יתווסף בקרוב.',

    'pets.title': 'חנות חיות',
    'pets.equip': 'צייד',
    'pets.unequip': 'הסר',
    'pets.supportCompanion': 'שותף תומך',
    'pets.info': 'מידע על {name}',
    'pets.role.attack': 'תקיפה',
    'pets.ability.heavyPulse': 'פעימת כוח',
    'pets.ability.mindControl': 'שליטה מחשבתית',
    'pets.ability.massCrash': 'ריסוק המוני',
    'pets.effect.siren': 'תן להם לעשות את העבודה.',
    'pets.rate.every8s': 'כל 8 שניות',
    'pets.rate.every9s': 'כל 9 שניות',
    'pets.stat.LIVES': 'חיים',
    'pets.stat.DAMAGE': 'נזק',
    'pets.stat.SHOOT_RATE': 'קצב ירי',
    'pets.stat.ABILITY': 'יכולת',
    'pets.stat.EFFECT': 'השפעה',
    'pets.stat.RATE': 'קצב',
    'pets.dog.short': 'שותף תומך',
    'pets.dog.long':
      'צ׳ימפו הוא שותף אוטונומי שעוזר לשחקן בקרב.\n\n' +
      'הוא מכוון אוטומטית לאויב הקרוב ביותר ויורה בקצב קבוע לאורך זמן. ' +
      'מצוין לתמיכה בתחילת המשחק ולהישרדות.',
    'pets.siren.short': 'שותפה תומכת',
    'pets.siren.long':
      'סיירן לא גורמת נזק ישיר.\n\n' +
      'היא משתלטת על מחשבות אויבים וגורמת להם לתקוף אחד את השני.\n' +
      'יעילה במיוחד בגלים צפופים.',

    'super.waveShield.title': 'מגן גל',
    'super.waveShield.desc':
      'יוצר גל אנרגיה חזק שחוסם נזק נכנס ומחזיר חלק ממנו לאויבים.',
    'super.superLaser.title': 'סופר לייזר',
    'super.superLaser.desc':
      'משגר קרן לייזר ארוכת טווח שגורמת נזק גבוה לאורך זמן.',
    'super.stat.Duration': 'משך',
    'super.stat.Cooldown': 'קירור',
    'super.stat.Reflect': 'החזרה',
    'super.stat.Damage': 'נזק',
    'super.stat.Pierce': 'חדירה',

    'inv.section.weapons.title': 'נשקים',
    'inv.section.weapons.sub': 'הנשקים שפתחת',
    'inv.section.pets.title': 'חיות',
    'inv.section.pets.sub': 'שותפים ועוזרים',
    'inv.section.skins.title': 'סקינים',
    'inv.section.skins.sub': 'קוסמטיקה שבבעלותך',
    'inv.section.supers.title': 'סופרים',
    'inv.section.supers.sub': 'יכולות מיוחדות',
    'inv.modal.skins': 'סקינים',
    'inv.modal.weapons': 'נשקים',
    'inv.modal.pets': 'חיות',
    'inv.modal.supers': 'סופרים',
    'inv.empty.skins': 'אין סקינים',
    'inv.empty.weapons': 'אין נשקים עדיין',
    'inv.empty.pets': 'אין חיות עדיין',
    'inv.empty.supers': 'אין סופרים עדיין',
    'inv.notOwned': 'לא בבעלותך',
    'inv.available': 'זמין',
    'inv.goToPetShop': 'עבור לחנות החיות',

    'game.title': 'המשחק',
    'game.victory': 'ניצחון!',
    'game.gameOver': 'נגמר המשחק!',
    'game.reward': 'הרווחת {coins} מטבעות',
    'game.betterLuck': 'בהצלחה בפעם הבאה!',
    'game.nextLevel': 'השלב הבא',
    'game.backToLobby': 'חזרה ללובי',
    'game.lobby': 'לובי',
    'game.tryAgain': 'נסה שוב',
    'game.newSkinUnlocked': 'סקין חדש נפתח',
    'game.collect': 'אסוף',
    'game.lockedLevel': 'שלב {level} נעול!\nסיים קודם את השלבים הקודמים.',
    'game.lives': 'חיים:',
    'game.level': 'שלב {level}',
    'game.levelColon': 'שלב {level}:',
    'game.stage.100.title': 'שלב 100:',
    'game.stage.90.title': 'שלב 90: ליבת הסערה',
    'game.stage.80.title': 'שלב 80: קיר הגלים',
    'game.stage.70.title': 'שלב 70: כאוס מגנטי',
    'game.stage.60.title': 'שלב 60: נעילת לייזר',
    'game.stage.100.1': 'זהו השלב האחרון... והחוקים עומדים להשתנות.',
    'game.stage.100.2': 'הפעם אין אנגלרים.',
    'game.stage.100.3': 'תתמודד מול כל הבוסים... ואז האחרון יופיע.',
    'game.stage.100.4': 'אחרי שכל בוס נופל תקבל שדרוג.',
    'game.stage.100.5': 'שרוד את כל האתגר כדי לסיים את השלב.',
    'game.stage.100.6': 'סיים את השלב כדי לפתוח סקין בלעדי שלא ניתן להשיג במקום אחר.',
    'game.stage.90.1': 'בוס 10 שולט במכות ברק ובאזורים חשמליים.',
    'game.stage.90.2': 'המשך לזוז והתרחק מאזורי סכנה מסומנים.',
    'game.stage.80.1': 'בוס 9 יוצר קירות גלים עם פתחים בטוחים וצרים.',
    'game.stage.80.2': 'קרא את הסימון וזוז מוקדם.',
    'game.stage.default.1': 'התכונן.',
    'game.stage.default.2': 'שרוד את השלב והבס כל דבר בדרך.',
    'game.enterChaos': 'היכנס לכאוס!',

    'upgrade.doubleShooter.title': 'ירייה כפולה',
    'upgrade.doubleShooter.sub': '+1 קליע',
    'upgrade.plusHp.title': 'עוד חיים',
    'upgrade.plusHp.sub': '+1 חיים',
    'upgrade.fasterShooter.title': 'ירי מהיר',
    'upgrade.fasterShooter.sub': 'בוסט לקצב',
    'upgrade.petFaster.title': 'חיה',
    'upgrade.petFaster.sub': 'מהירה יותר',
    'upgrade.damageUp.title': 'חיזוק נזק',
    'upgrade.damageUp.sub': '+1 נזק',
    'upgrade.speedBoost.title': 'בוסט מהירות',
    'upgrade.speedBoost.sub': '+מהירות תנועה',
    'upgrade.piercingShot.title': 'ירייה חודרת',
    'upgrade.piercingShot.sub': 'יריות עוברות דרך',
    'upgrade.superCharge.title': 'טעינת סופר',
    'upgrade.superCharge.sub': '+אנרגיית מד',
    'upgrade.shield.title': 'מגן',
    'upgrade.shield.sub': '20 שניות הגנה',
  },

  es: {
    'settings.title': 'Ajustes',
    'settings.music': 'Música',
    'settings.audio': 'Audio',
    'settings.language': 'Idioma',
    'settings.audioVolume': 'Volumen de sonido',
    'settings.musicVolume': 'Volumen de música',

    'profile.name': 'Nombre de perfil:',
    'profile.daysPlayed': 'Días jugados:',
    'profile.changeName': 'Cambiar nombre',
    'profile.icon': 'Icono de perfil',
    'profile.account': 'Cuenta',
    'main.title': 'Lobby principal',

    'map.title': 'NIVELES',
    'loadout.title': 'EQUIPO',
    'inventory.title': 'INVENTARIO',
    'social.title': 'ÚNETE A LA COMUNIDAD',
    'home.battle': 'BATALLA',

    'nav.shop': 'Tienda',
    'nav.loadout': 'Equipo',
    'nav.battle': '¡Batalla!',
    'nav.inventory': 'Inventario',

    'ui.free': 'GRATIS',
    'ui.owned': 'OBTENIDO',
    'ui.buy': 'COMPRAR',
    'ui.get': 'OBTENER',
    'ui.claim': 'RECLAMAR',
    'ui.claimed': 'RECLAMADO',
    'ui.equip': 'EQUIPAR',
    'ui.equipped': 'EQUIPADO',
    'ui.locked': 'BLOQUEADO',
    'ui.open': 'ABRIR',
    'ui.close': 'CERRAR',
    'ui.cancel': 'CANCELAR',
    'ui.item': 'Ítem',
    'ui.desc': 'Descripción',
    'ui.weapon': 'ARMA',
    'ui.price': 'PRECIO',
    'ui.rarity': 'RAREZA',
    'rarity.COMMON': 'COMÚN',
    'rarity.RARE': 'RARO',
    'rarity.EPIC': 'ÉPICO',
    'rarity.LEGENDARY': 'LEGENDARIO',
    'ui.role': 'ROL:',
    'ui.ability': 'HABILIDAD:',
    'ui.stats': 'ESTADÍSTICAS',
    'ui.shop': 'TIENDA',
    'ui.goToShop': 'IR A LA TIENDA',
    'ui.goToSuperShop': 'IR A TIENDA SÚPER',
    'ui.goToLoadout': 'IR A EQUIPO',
    'ui.comingSoon': 'Próximamente...',
    'ui.yes': 'Sí',

    'toast.noCoins': '¡No hay suficientes monedas!',
    'toast.alreadyOwned': '¡Ya lo tienes!',
    'toast.boughtEquipped': '¡Compraste y equipaste {name}!',
    'toast.superPurchased': '¡Súper comprado y equipado!',
    'toast.superUnlocked': '¡Súper desbloqueado y equipado!',

    'shop.title': 'TIENDA',
    'shop.sub': 'Ofertas • Estilo • Poder',
    'shop.dailyOffers': 'OFERTAS DIARIAS',
    'shop.freeGift': 'BONO DIARIO',
    'shop.skinOffers': 'OFERTAS DE SKINS',
    'shop.featured': 'DESTACADO',
    'shop.coins': 'MONEDAS',
    'shop.refreshesDaily': 'Se renueva a diario',
    'shop.everyDay': 'Cada día',
    'shop.limited': 'Limitado',
    'shop.bestValue': 'Paquetes con mejor valor',
    'shop.featuredTag': 'LANZAMIENTO ESPECIAL',
    'shop.newFeaturedIn': 'NUEVO DESTACADO EN {time}',
    'shop.notEnoughCoins': 'No tienes suficientes monedas',
    'shop.skinPurchased': '¡Skin comprada!',
    'shop.featuredUnlocked': '¡Destacado desbloqueado!',
    'shop.dealPurchased': '¡Oferta comprada!',
    'shop.alreadyOwnedBonus': 'Ya lo tienes. Bonus: +{coins} monedas',
    'shop.dailyGiftCoins': 'Regalo diario: +{coins} monedas',
    'shop.boostUnlocked': 'Boost desbloqueado: {name}',
    'shop.unlocked': 'Desbloqueado: {name}',
    'shop.confirmSuper': '¿Seguro que quieres comprar este súper?',
    'shop.dailyGiftClaimed': '¡Regalo diario reclamado! +{coins} monedas',
    'shop.coinClaimed': '¡+{coins} monedas!',
    'shop.paymentUnavailable': 'El pago todavía no está conectado.',

    'shop.gift.title': 'Regalo diario',
    'shop.gift.tag': 'DIARIO',
    'shop.gift.freeCoinsToday': 'Monedas gratis de hoy',
    'shop.gift.unlockBoost': 'Desbloquea un boost',
    'shop.gift.unlockDaily': 'Desbloquea un ítem diario',
    'shop.gift.claimYourReward': 'Reclama tu recompensa',
    'shop.gift.dailyGift': 'Regalo diario',
    'shop.gift.paidCoinsOnly': 'Los paquetes de monedas requieren pago.',

    'loadout.weapons': 'Armas',
    'loadout.pets': 'Mascotas',
    'loadout.super': 'Súper',
    'loadout.upgrade': 'Mejora',

    'planet.levelRange': 'Niveles {start} - {end}',

    'weapon.laser.name': 'Láser',
    'weapon.laser.desc': 'Disparos rápidos con alta cadencia.',
    'weapon.missile.name': 'Misil',
    'weapon.missile.desc': 'Proyectil pesado con impacto fuerte.',
    'weapon.triangleShooter.name': 'Disparador triangular',
    'weapon.triangleShooter.desc': 'Disparos amplios para controlar grupos.',
    'weapon.statsComingSoon': 'Estadísticas próximamente.',
    'weapon.descComingSoon': 'Descripción del arma próximamente.',

    'pets.title': 'TIENDA DE MASCOTAS',
    'pets.equip': 'EQUIPAR',
    'pets.unequip': 'QUITAR',
    'pets.supportCompanion': 'Compañero de apoyo',
    'pets.info': 'Info de {name}',
    'pets.role.attack': 'ATAQUE',
    'pets.ability.heavyPulse': 'Pulso pesado',
    'pets.ability.mindControl': 'Control mental',
    'pets.ability.massCrash': 'Choque masivo',
    'pets.effect.siren': 'Que ellos hagan el trabajo.',
    'pets.rate.every8s': 'Cada 8s',
    'pets.rate.every9s': 'Cada 9s',
    'pets.stat.LIVES': 'Vidas',
    'pets.stat.DAMAGE': 'Daño',
    'pets.stat.SHOOT_RATE': 'Cadencia',
    'pets.stat.ABILITY': 'Habilidad',
    'pets.stat.EFFECT': 'Efecto',
    'pets.stat.RATE': 'Frecuencia',
    'pets.dog.short': 'Compañero de apoyo',
    'pets.dog.long':
      'Chimpo es un compañero autónomo que ayuda al jugador en batalla.\n\n' +
      'Apunta automáticamente al enemigo más cercano y dispara de forma constante. ' +
      'Perfecto para apoyo temprano y supervivencia.',
    'pets.siren.short': 'Compañera de apoyo',
    'pets.siren.long':
      'Siren no hace daño directo.\n\n' +
      'Manipula la mente de los enemigos para que se ataquen entre sí.\n' +
      'Muy eficaz en oleadas con muchos enemigos.',

    'super.waveShield.title': 'ESCUDO DE ONDA',
    'super.waveShield.desc':
      'Genera una onda de energía que bloquea el daño entrante y refleja parte a los enemigos.',
    'super.superLaser.title': 'SÚPER LÁSER',
    'super.superLaser.desc':
      'Canaliza un rayo láser de largo alcance que inflige mucho daño con el tiempo.',
    'super.stat.Duration': 'Duración',
    'super.stat.Cooldown': 'Enfriamiento',
    'super.stat.Reflect': 'Reflejo',
    'super.stat.Damage': 'Daño',
    'super.stat.Pierce': 'Perforación',

    'inv.section.weapons.title': 'Armas',
    'inv.section.weapons.sub': 'Tus armas desbloqueadas',
    'inv.section.pets.title': 'Mascotas',
    'inv.section.pets.sub': 'Compañeros y ayudantes',
    'inv.section.skins.title': 'Skins',
    'inv.section.skins.sub': 'Cosméticos que tienes',
    'inv.section.supers.title': 'Súpers',
    'inv.section.supers.sub': 'Habilidades especiales',
    'inv.modal.skins': 'SKINS',
    'inv.modal.weapons': 'ARMAS',
    'inv.modal.pets': 'MASCOTAS',
    'inv.modal.supers': 'SÚPERS',
    'inv.empty.skins': 'No hay skins',
    'inv.empty.weapons': 'Aún no hay armas',
    'inv.empty.pets': 'Aún no hay mascotas',
    'inv.empty.supers': 'Aún no hay súpers',
    'inv.notOwned': 'NO OBTENIDO',
    'inv.available': 'DISPONIBLE',
    'inv.goToPetShop': 'IR A TIENDA DE MASCOTAS',

    'game.title': 'El Juego',
    'game.victory': '¡Victoria!',
    'game.gameOver': '¡Fin del juego!',
    'game.reward': 'Ganaste {coins} monedas',
    'game.betterLuck': '¡Más suerte la próxima vez!',
    'game.nextLevel': 'Siguiente nivel',
    'game.backToLobby': 'Volver al lobby',
    'game.lobby': 'Lobby',
    'game.tryAgain': 'Intentar otra vez',
    'game.newSkinUnlocked': 'NUEVA SKIN DESBLOQUEADA',
    'game.collect': 'RECLAMAR',
    'game.lockedLevel': '¡El nivel {level} está bloqueado!\nCompleta primero los niveles anteriores.',
    'game.lives': 'Vidas:',
    'game.level': 'NIVEL {level}',
    'game.levelColon': 'NIVEL {level}:',
    'game.stage.100.title': 'NIVEL 100:',
    'game.stage.90.title': 'NIVEL 90: NÚCLEO DE TORMENTA',
    'game.stage.80.title': 'NIVEL 80: MURO DE ONDAS',
    'game.stage.70.title': 'NIVEL 70: CAOS MAGNÉTICO',
    'game.stage.60.title': 'NIVEL 60: BLOQUEO LÁSER',
    'game.stage.100.1': 'Esta es la fase final... y las reglas están por cambiar.',
    'game.stage.100.2': 'Esta vez no hay Anglers.',
    'game.stage.100.3': 'Te enfrentarás a todos los jefes... y luego aparecerá el final.',
    'game.stage.100.4': 'Después de derrotar cada jefe ganarás una mejora.',
    'game.stage.100.5': 'Sobrevive a todo el desafío para completar el nivel.',
    'game.stage.100.6': 'Completa esta fase para desbloquear una skin exclusiva que no se consigue en otro lugar.',
    'game.stage.90.1': 'Boss10 controla rayos y zonas eléctricas.',
    'game.stage.90.2': 'Sigue moviéndote y evita las zonas de peligro marcadas.',
    'game.stage.80.1': 'Boss9 crea muros de onda con huecos seguros estrechos.',
    'game.stage.80.2': 'Lee la señal y muévete pronto.',
    'game.stage.default.1': 'Prepárate.',
    'game.stage.default.2': 'Sobrevive la fase y derrota todo a tu paso.',
    'game.enterChaos': '¡ENTRA AL CAOS!',

    'upgrade.doubleShooter.title': 'Disparo doble',
    'upgrade.doubleShooter.sub': '+1 proyectil',
    'upgrade.plusHp.title': 'HP extra',
    'upgrade.plusHp.sub': '+1 vida',
    'upgrade.fasterShooter.title': 'Fuego rápido',
    'upgrade.fasterShooter.sub': 'Boost de cadencia',
    'upgrade.petFaster.title': 'Mascota',
    'upgrade.petFaster.sub': 'Más rápida',
    'upgrade.damageUp.title': 'Más daño',
    'upgrade.damageUp.sub': '+1 daño',
    'upgrade.speedBoost.title': 'Boost de velocidad',
    'upgrade.speedBoost.sub': '+velocidad',
    'upgrade.piercingShot.title': 'Disparo perforante',
    'upgrade.piercingShot.sub': 'Disparos atraviesan',
    'upgrade.superCharge.title': 'Carga súper',
    'upgrade.superCharge.sub': '+energía',
    'upgrade.shield.title': 'Escudo',
    'upgrade.shield.sub': '20s de protección',
  },
};

const TRANSLATABLE_DATA = {
  shop: {
    featured: {
      galaxyPass: {
        en: { name: 'Galaxy Pass', desc: 'Unlock a premium reward track + bonus coins' },
        he: { name: 'גלקסי פאס', desc: 'פתח מסלול פרסים פרימיום + מטבעות בונוס' },
        es: { name: 'Pase Galaxia', desc: 'Desbloquea recompensas premium + monedas extra' },
      },
      galaxySkin: {
        en: { name: 'Galaxy Skin', desc: 'Get this skin before it leaves' },
        he: { name: 'סקין גלקסי', desc: 'קח את הסקין לפני שהוא נעלם' },
        es: { name: 'Skin Galaxia', desc: 'Consigue esta skin antes de que desaparezca' },
      },
    },
    dailyPool: {
      daily_pet_food: {
        en: { name: 'Pet Treat', desc: 'Pet bonus for 3 battles', badge: 'NEW' },
        he: { name: 'חטיף לחיה', desc: 'בונוס לחיה ל-3 קרבות', badge: 'חדש' },
        es: { name: 'Premio Mascota', desc: 'Bono para mascota por 3 batallas', badge: 'NUEVO' },
      },
      daily_coin_bundle: {
        en: { name: 'Mini Coins', desc: '+350 coins', badge: 'VALUE' },
        he: { name: 'מיני מטבעות', desc: '+350 מטבעות', badge: 'משתלם' },
        es: { name: 'Monedas Mini', desc: '+350 monedas', badge: 'VALOR' },
      },
      daily_fire_rate: {
        en: { name: 'Rapid Fire', desc: '+25% fire rate (2 battles)', badge: 'LIMIT' },
        he: { name: 'אש מהירה', desc: '+25% קצב ירי (2 קרבות)', badge: 'מוגבל' },
        es: { name: 'Fuego Rápido', desc: '+25% cadencia (2 batallas)', badge: 'LÍMITE' },
      },
      daily_revive: {
        en: { name: 'Instant Revive', desc: 'Revive once on death', badge: 'RARE' },
        he: { name: 'החייאה מיידית', desc: 'חזרה לחיים פעם אחת במוות', badge: 'נדיר' },
        es: { name: 'Revivir Instantáneo', desc: 'Revive una vez al morir', badge: 'RARO' },
      },
      daily_super_charge: {
        en: { name: 'Super Charge', desc: 'Start battle with full super', badge: 'POWER' },
        he: { name: 'טעינת סופר', desc: 'מתחילים קרב עם סופר מלא', badge: 'כוח' },
        es: { name: 'Carga Súper', desc: 'Empieza con el súper lleno', badge: 'PODER' },
      },
      daily_random_box: {
        en: { name: 'Mystery Box', desc: 'Random reward', badge: '???' },
        he: { name: 'קופסת מסתורין', desc: 'פרס אקראי', badge: '???' },
        es: { name: 'Caja Misteriosa', desc: 'Recompensa aleatoria', badge: '???' },
      },
      daily_coin_rush: {
        en: { name: 'Coin Rush', desc: 'Double coins for 2 battles', badge: 'VALUE' },
        he: { name: 'מרוץ מטבעות', desc: 'כפל מטבעות ל-2 קרבות', badge: 'משתלם' },
        es: { name: 'Lluvia de Monedas', desc: 'Doble monedas por 2 batallas', badge: 'VALOR' },
      },
    },
    skins: {
      default: {
        en: { name: 'Classic', desc: '' },
        he: { name: 'קלאסי', desc: '' },
        es: { name: 'Clásico', desc: '' },
      },
      redclassic: {
        en: { name: 'Red Classic', desc: 'Red classic' },
        he: { name: 'קלאסי אדום', desc: 'קלאסי בצבע אדום' },
        es: { name: 'Clásico Rojo', desc: 'Clásico en rojo' },
      },
      dark_reaper: {
        en: { name: 'Dark Reaper', desc: 'Dark metallic finish' },
        he: { name: 'קוצר אפל', desc: 'גימור מתכתי כהה' },
        es: { name: 'Segador Oscuro', desc: 'Acabado metálico oscuro' },
      },
      celestialsakura: {
        en: { name: 'Celestial Sakura', desc: 'Pink petals FX' },
        he: { name: 'סאקורה שמיימית', desc: 'אפקט עלי כותרת ורודים' },
        es: { name: 'Sakura Celestial', desc: 'FX de pétalos rosas' },
      },
      celestial_sakura: {
        en: { name: 'Celestial Sakura', desc: 'Pink petals FX' },
        he: { name: 'סאקורה שמיימית', desc: 'אפקט עלי כותרת ורודים' },
        es: { name: 'Sakura Celestial', desc: 'FX de pétalos rosas' },
      },
      goden_core: {
        en: { name: 'Golden Core', desc: 'Gold shine aura' },
        he: { name: 'ליבה זהובה', desc: 'הילה זהובה זוהרת' },
        es: { name: 'Núcleo Dorado', desc: 'Aura brillante dorada' },
      },
      star_breaker: {
        en: { name: 'Star Breaker', desc: 'Unlocked by beating Level 100' },
        he: { name: 'שובר כוכבים', desc: 'נפתח אחרי ניצחון בשלב 100' },
        es: { name: 'Rompeestrellas', desc: 'Se desbloquea al superar el nivel 100' },
      },
    },
    coinPacks: {
      coins_1000: {
        en: { name: '1000 Coins', desc: 'Small boost' },
        he: { name: '1000 מטבעות', desc: 'חיזוק קטן' },
        es: { name: '1000 Monedas', desc: 'Impulso pequeño' },
      },
      coins_3000: {
        en: { name: '3000 Coins', desc: 'Good value' },
        he: { name: '3000 מטבעות', desc: 'תמורה טובה' },
        es: { name: '3000 Monedas', desc: 'Buena relación' },
      },
      coins_6000: {
        en: { name: '6000 Coins', desc: 'Big pack' },
        he: { name: '6000 מטבעות', desc: 'חבילה גדולה' },
        es: { name: '6000 Monedas', desc: 'Paquete grande' },
      },
      coins_10000: {
        en: { name: '10000 Coins', desc: 'Mega pack' },
        he: { name: '10000 מטבעות', desc: 'חבילת ענק' },
        es: { name: '10000 Monedas', desc: 'Paquete mega' },
      },
    },
    dailyGiftPool: {
      small_coin_pack: {
        en: { name: 'Small Coin Pack' },
        he: { name: 'חבילת מטבעות קטנה' },
        es: { name: 'Paquete pequeño de monedas' },
      },
      coin_pack: {
        en: { name: 'Coin Pack' },
        he: { name: 'חבילת מטבעות' },
        es: { name: 'Paquete de monedas' },
      },
      big_coin_pack: {
        en: { name: 'Big Coin Pack' },
        he: { name: 'חבילת מטבעות גדולה' },
        es: { name: 'Paquete grande de monedas' },
      },
    },
  },
};

function getLang() {
  return localStorage.getItem('language') || 'en';
}

function t(langOrKey, keyOrParams, maybeParams = null) {
  let lang = langOrKey;
  let key = keyOrParams;
  let params = maybeParams;

  if (typeof keyOrParams !== 'string') {
    lang = getLang();
    key = langOrKey;
    params = keyOrParams || null;
  }

  const safeLang = TRANSLATIONS[lang] ? lang : 'en';
  const str =
    TRANSLATIONS?.[safeLang]?.[key] ?? TRANSLATIONS?.en?.[key] ?? key;

  if (!params) return str;

  return str.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] !== undefined ? String(params[k]) : `{${k}}`
  );
}

function dataT(group, id, field, lang = getLang()) {
  const data = TRANSLATABLE_DATA?.shop?.[group]?.[id];
  return data?.[lang]?.[field] ?? data?.en?.[field] ?? null;
}

function applyDirection(lang) {
  const nextLang = TRANSLATIONS[lang] ? lang : 'en';
  const isRTL = nextLang === 'he';
  document.documentElement.lang = nextLang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  if (document.body) {
    document.body.dir = isRTL ? 'rtl' : 'ltr';
    document.body.style.direction = isRTL ? 'rtl' : 'ltr';
  }
}

function applyLanguage(lang) {
  const nextLang = TRANSLATIONS[lang] ? lang : 'en';

  localStorage.setItem('language', nextLang);
  applyDirection(nextLang);
  document.title = t(nextLang, document.body?.dataset?.titleI18n || 'game.title');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(nextLang, key);
  });

  document.querySelectorAll('[data-i18n-label]').forEach((el) => {
    const label = t(nextLang, el.dataset.i18nLabel);
    el.setAttribute('aria-label', label);
    el.setAttribute('title', label);
  });

  shopApplyLangToData?.(nextLang);

  updateEquipUI?.();
  updatePetUI?.();
  updateSuperEquipUI?.();
  updateLevelsMap?.();
  renderInventoryOverview?.();

  if (document.getElementById('shopScreen')) {
    shopRenderFeatured?.();
    shopRenderDaily?.();
    shopRenderSkinOffers?.();
    shopRenderSkins?.();
    shopRenderCoins?.();
    renderDailyGiftCard?.();
    updateDailyGiftUI?.();
  }

  shopOnEnter?.();
  invRerenderIfOpen?.();
}

function initLanguageUI() {
  const languageBtn = document.getElementById('languageBtn');
  const languageMenu = document.getElementById('languageMenu');
  const languageOptions = document.querySelectorAll('.languageOption');

  if (!languageBtn || !languageMenu || !languageOptions.length) return;

  languageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    languageMenu.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    languageMenu.classList.remove('open');
  });

  languageMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  languageOptions.forEach((btn) => {
    btn.addEventListener('click', () => {
      languageMenu.classList.remove('open');
      applyLanguage(btn.dataset.lang);
    });
  });
}

function initPageLanguage() {
  applyLanguage(getLang());
}

window.TRANSLATIONS = TRANSLATIONS;
window.TRANSLATABLE_DATA = TRANSLATABLE_DATA;
window.getLang = getLang;
window.t = t;
window.dataT = dataT;
window.applyDirection = applyDirection;
window.applyLanguage = applyLanguage;
window.initLanguageUI = initLanguageUI;
window.initPageLanguage = initPageLanguage;
