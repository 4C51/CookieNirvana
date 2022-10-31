Game.Win('Third-party');
if (CookieNirvana === undefined) var CookieNirvana = {};
if (typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');
CookieNirvana.name = 'Cookie Nirvana';
CookieNirvana.version = '2.048';
CookieNirvana.GameVersion = '2.048';

CookieNirvana.launch = function () {
	CookieNirvana.init = function () {
		CookieNirvana.isLoaded = true;
		CookieNirvana.backup = {};
		CookieNirvana.config = {};

		CookieNirvana.loadConfig();
		CCSE.customLoad.push(CookieNirvana.loadConfig);
		CCSE.customSave.push(CookieNirvana.saveConfig);

		Game.customOptionsMenu.push(function () {
			CCSE.AppendCollapsibleOptionsMenu(CookieNirvana.name, CookieNirvana.getMenuString());
		});

		Game.customStatsMenu.push(function () {
			CCSE.AppendStatsVersionNumber(CookieNirvana.name, CookieNirvana.version);
		});

		if (CookieNirvana.postLoadHooks) {
			for (var i = 0; i < CookieNirvana.postLoadHooks.length; i++) {
				(CookieNirvana.postLoadHooks[i])();
			}
		}

		if (Game.prefs.popups) Game.Popup('Cookie Nirvana loaded!');
		else Game.Notify('Cookie Nirvana loaded!', '', '', 1, 1);
	}

	//=================//
	//	Configuration  //
	//=================//

	CookieNirvana.saveConfig = function () {
		CCSE.config.OtherMods.CookieNirvana = CookieNirvana.config;
	}

	CookieNirvana.loadConfig = function () {
		let config = CCSE.config.OtherMods.CookieNirvana;
		CookieNirvana.config = config || CookieNirvana.defaultConfig();
	}

	CookieNirvana.getMenuString = function () {
		return `<div class="listing">
			${CCSE.MenuHelper.InputBox('empowerFrenzyInterval', 100, CookieNirvana.config.empower.frenzyInterval, (v) => CookieNirvana.config.empower.frenzyInterval = v)}
			<label>Empower Frenzy Interval</label>
		</div>`;
	}

	CookieNirvana.defaultConfig = function () {
		return {
			empower: {
				frenzyInterval: 500,
				empowerBuffs: ['Click frenzy', 'Elder frenzy', 'Dragonflight'],
				empoweredFrenzy: true,
				empoweredBuildings: ['Cursor'],
				devastationInterval: 10
			},
			autoclick: {
				clickInterval: 1,
				autoclickBuffs: ['Click frenzy', 'Elder frenzy', 'Dragonflight'],
				autoclickGCs: true,
				autoclickReindeer: true,
				autopopWrinklers: true,
				wrinklerInterval: 500
			},
			autobuy: {
				buyInterval: 500,
				autoBuyUpgrades: true,
				autoBuyBuildings: true,
				autoBuyAmount: 10,
				affordableCpsFactor: 0.1,
				affordableBankFactor: 10,
				affordableCpsOverrides: {
					Cursor: 6
				},
				affordableBankOverrides: {
					Cursor: 0
				}
			}
		}
	}

	CookieNirvana.updatePref = function (section, pref, value) {
		let sectionPrefs = CookieNirvana.config[section] || CookieNirvana.config;
		sectionPrefs[pref] = value;
	}

	//====================//
	//	Empowered Frenzy  //
	//====================//

	CookieNirvana.empowerSpam = function empowerSpam() {
		function cycleBuilding(building) {
			let currentMode = Game.buyMode;
			Game.storeBulkButton(0);
			let count = Game.Objects[building].amount;
			Game.Objects[building].sell(count);
			Game.Objects[building].buy(count);
			Game.storeBulkButton(currentMode === 1 ? 0 : 1);
		}

		function cycleBuildings() {
			let empoweredBuildings = CookieNirvana.config.empower.empoweredBuildings;
			for (var i = 0; i < empoweredBuildings.length; i++) {
				cycleBuilding(empoweredBuildings[i]);
			}
		}

		cycleBuildings();

		CookieNirvana.empoweredSpamming = setInterval(function () {
			cycleBuildings();

			if (Game.hasBuff('Devastation').time < Game.fps / 4) {
				clearInterval(CookieNirvana.empoweredSpamming);
				CookieNirvana.empoweredSpamming = false;
				resolve();
			}
		}, CookieNirvana.config.empower.devastationInterval)
	}

	CookieNirvana.startAutoFrenzy = function () {
		clearInterval(CookieNirvana.frenzyWatch);
		clearInterval(CookieNirvana.empoweredSpamming)
		CookieNirvana.empoweredSpamming = false;
		clearInterval(CookieNirvana.clickSpamming)
		CookieNirvana.clickSpamming = false;

		function checkBuffs(buffs) {
			for (var i = 0; i < buffs.length; i++) {
				if (Game.hasBuff(buffs[i])) return true;
			}

			return false;
		}

		function checkEmpowerBuffs() {
			return checkBuffs(CookieNirvana.config.empower.empowerBuffs);
		}

		function checkAutoclickBuffs() {
			return checkBuffs(CookieNirvana.config.empower.autoclickBuffs);
		}

		CookieNirvana.frenzyWatch = setInterval(function () {
			var ruinAvailable = Game.Objects.Temple.minigame.gods.ruin.slot !== -1;
			let hasEmpowerBuff = checkEmpowerBuffs();
			let hasAutoclickBuff = checkAutoclickBuffs();

			// empower spam
			if (hasEmpowerBuff && ruinAvailable && !CookieNirvana.empoweredSpamming) {
				CookieNirvana.empowerSpam();
			}

			if (!hasEmpowerBuff && CookieNirvana.empoweredSpamming) {
				clearInterval(CookieNirvana.empoweredSpamming);
				CookieNirvana.empoweredSpamming = false;
			}

			// autoclick
			if (hasAutoclickBuff && !CookieNirvana.clickSpamming) {
				ookieNirvana.clickSpamming = setInterval(Game.ClickCookie, 1);
			}

			if (!hasAutoclickBuff && CookieNirvana.clickSpamming) {
				clearInterval(CookieNirvana.clickSpamming);
				CookieNirvana.clickSpamming = false;
			}

			Game.shimmers.forEach(function (shimmer) {
				if (shimmer.type === 'reindeer') {
					if (CookieNirvana.config.autoclick.autoclickReindeer) shimmer.pop();
					return;
				}

				if (CookieNirvana.config.autoclick.autoclickGCs) {
					shimmer.pop();
				}
			});
		}, CookieNirvana.config.empower.frenzyInterval);
	}

	CookieNirvana.stopAutoFrenzy = function () {
		clearInterval(CookieNirvana.frenzyWatch);
		clearInterval(CookieNirvana.empoweredSpamming)
		CookieNirvana.empoweredSpamming = false;
		clearInterval(CookieNirvana.clickSpamming)
		CookieNirvana.clickSpamming = false;
	}

	//============//
	//	Auto Pop  //
	//============//

	CookieNirvana.startAutoPopWrinklers = function () {
		clearInterval(CookieNirvana.wrinklerWatch);
		CookieNirvana.wrinklerWatch = setInterval(function () {
			for (var i in Game.wrinklers) {
				if (Game.wrinklers[i].sucked > 0 && Game.wrinklers[i].type == 0) {
					Game.wrinklers[i].hp = 0;
				}
			}
		}, CookieNirvana.config.autoclick.wrinklerInterval);
	}

	CookieNirvana.stopAutoPopWrinklers = function () {
		clearInterval(CookieNirvana.wrinklerWatch);
	}

	//============//
	//	Auto Buy  //
	//============//

	CookieNirvana.startAutoBuy = function () {
		clearInterval(CookieNirvana.buyWatch);

		function buyUpgrades() {
			let upgradesToBuy = Game.UpgradesById.filter(upgrade => upgrade.unlocked && !upgrade.bought && !upgrade.pool && !Game.vault.includes(upgrade.id));
			for (var i = 0; i < upgradesToBuy.length; i++) {
				if (Game.cookies > upgradesToBuy[i].getPrice() * CookieNirvana.config.autobuy.affordableBankFactor) {
					upgradesToBuy[i].buy();
				}
			}
		}

		function getAffordability(building, price) {
			let buyAmount = CookieNirvana.config.autobuy.autoBuyAmount;
			let affordableCps = CookieNirvana.config.autobuy.affordableCpsFactor * buyAmount;
			let affordableBank = CookieNirvana.config.autobuy.affordableBankFactor;

			let overrideCps = CookieNirvana.config.autobuy.affordableCpsOverrides[building];
			let overrideBank = CookieNirvana.config.autobuy.affordableBankOverrides[building];

			if (overrideCps !== undefined) {
				affordableCps = overrideCps * buyAmount;
			}

			if (overrideBank !== undefined) {
				affordableBank = overrideBank;
			}

			return Game.unbuffedCps * affordableCps > price || Game.cookies > price * affordableBank;
		}

		CookieNirvana.buyWatch = setInterval(function () {
			if (CookieNirvana.empoweredSpamming) return;
			let buyAmount = CookieNirvana.config.autobuy.autoBuyAmount;

			if (Game.Has('Inspired checklist')) Game.storeBuyAll();
			else buyUpgrades();

			for (let i in Game.Objects) {
				let price = Game.Objects[i].getSumPrice(buyAmount);
				getAffordability(Game.Objects[i], price) && Game.Objects[i].buy(buyAmount);
			}
		}, CookieNirvana.config.autobuy.buyInterval);
	}

	CookieNirvana.stopAutoBuy = function () {
		clearInterval(CookieNirvana.buyWatch);
	}

	CookieNirvana.startAll = function () {
		CookieNirvana.startAutoBuy();
		CookieNirvana.startAutoFrenzy();
		CookieNirvana.startAutoPopWrinklers();
	}

	CookieNirvana.stopAll = function () {
		CookieNirvana.stopAutoBuy();
		CookieNirvana.stopAutoFrenzy();
		CookieNirvana.stopAutoPopWrinklers();
	}

	if (CCSE.ConfirmGameVersion(CookieNirvana.name, CookieNirvana.version, CookieNirvana.GameVersion)) CookieNirvana.init();
}

if (!CookieNirvana.isLoaded) {
	if (CCSE !== undefined && CCSE.isLoaded) {
		CookieNirvana.launch();
	}
	else {
		if (CCSE === undefined) var CCSE = {};
		if (!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(CookieNirvana.launch);
	}
}
