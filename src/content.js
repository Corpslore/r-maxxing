// All copy lives here so it can be edited without touching app logic.
// In big headlines, "|" is a line break. Each line gets scaled to fill the width.

export const BRAND = {
  // A hyphen in the name is drawn as a censor bar in the logo.
  name: 'R-MAXXING',
  tagline: 'Not a thought.',
};

export const CLOSER = 'At the end of the day, it’s the end of the day.';

// The opener: tap-through cards like Stories, one idea each. `ms` is how long a card holds
// before moving on by itself; the last card waits for the button. `then` slams in after a beat.
export const INTRO_CARDS = [
  { id: 'vs', tone: 'ink', ms: 3800, head: 'WE WIN.|EVERY.|TIME.' },
  { id: 'spiral', tone: 'sun', ms: 3400, head: 'OVERTHINKERS|SPIRAL.', then: 'WE JUST|ACT.' },
  {
    id: 'everest',
    tone: 'blue',
    ms: 4200,
    head: 'THEY ASK IF IT|CAN BE DONE.',
    then: 'WE CLIMB|EVEREST|ON A DARE.*',
    foot: '*Please don’t. That’s a one-way door. We’ll get to that.',
  },
  { id: 'raccoon', tone: 'pink', ms: 5000, head: 'WE ARE THE|RACCOON|IN A HELMET,|RACING A GROCERY CART|DOWN A WATERSLIDE.' },
  { id: 'free', tone: 'sun', head: 'WE ARE|SETTING PEOPLE|FREE HERE,|MY GUY.' },
];

export const INTRO = {
  sub: 'First: how many thoughts are in there? 7 questions. Don’t think about it.',
  cta: 'SCAN MY BRAIN',
  skip: 'I already know it’s bad',
  replay: '↻ Watch that again',
  rival: 'OVERTHINKER',
};

export const HOME_CTA = 'BROTHER, I’M THINKING AGAIN';

export const QUIZ = [
  { q: 'THE MENU HAS|40 THINGS ON IT.', a: ['Point at one.', 'Check the reviews.', 'Find photos of this exact dish from 2019.'] },
  { q: 'YOU HAVE A 2-LINE|TEXT TO SEND.', a: ['Sent.', 'Rewrote it twice.', 'It’s in the group chat for review.'] },
  { q: 'IT’S 3AM.|YOUR BRAIN IS…', a: ['Asleep.', 'Replaying something from 2014.', 'Winning an argument that hasn’t happened.'] },
  { q: 'YOU’RE BUYING|A $20 THING.', a: ['Bought it.', 'Seven tabs open.', 'It’s in a spreadsheet.'] },
  { q: 'YOUR BIG|IDEA IS…', a: ['Out there. It’s bad. It’s fine.', 'Almost ready.', 'It has a logo and no product.'] },
  { q: 'SOMEONE SAYS|“WE SHOULD TALK.”', a: ['Okay.', 'About what?', 'You’ve already drafted your defense.'] },
  { q: 'WHERE DO YOU|WANT TO EAT?', a: ['Tacos.', 'I’m good with whatever.', 'Let me get back to you.'] },
];

export const TYPES = [
  { name: 'BOWLING BALL', roast: 'Not a thought. Pure. The elders would like to meet you.' },
  { name: 'LIGHT CREASING', roast: 'A few folds. You mostly just do stuff. Respect.' },
  { name: 'THE COMMITTEE', roast: 'Every decision goes to a vote. Nobody has ever won.' },
  { name: 'RESEARCH PHASE', roast: 'You’ve been looking into it since 2023.' },
  { name: 'FULL WALNUT', roast: 'It’s all folds in there, brother. We have work to do.' },
];

export const THINK_TIMES = [
  { id: 'hour', label: 'AN HOUR', minutes: 60 },
  { id: 'day', label: 'A DAY', minutes: 1440 },
  { id: 'week', label: 'A WEEK', minutes: 10080 },
  { id: 'month', label: 'A MONTH', minutes: 43200 },
  { id: 'year', label: 'A YEAR OR MORE', minutes: 525600 },
];

// "yes" means the left-hand answer in core.doorVerdict's terms.
export const DOOR = [
  { key: 'serious', q: 'IS A DOCTOR,|A LAWYER, A COP|OR YOUR BANK|INVOLVED?', sub: 'Or could somebody get hurt?', yes: 'YEAH', no: 'NAH' },
  { key: 'undo', q: 'CAN YOU|UNDO IT?', sub: 'If it goes bad, can you try again?', yes: 'YEAH', no: 'NAH' },
  { key: 'cheap', q: 'WORST CASE:|EMBARRASSING|OR EXPENSIVE?', yes: 'EMBARRASSING', no: 'EXPENSIVE' },
  { key: 'solo', q: 'WHO PAYS IF|IT GOES BAD?', yes: 'JUST ME', no: 'OTHER PEOPLE' },
];

export const VERDICTS = {
  send: { title: 'SEND|IT.', sub: 'Two-way door, brother. If it’s bad in there, come back out.', cta: 'LET’S GO' },
  shrink: { title: 'TOO BIG.|MAKE IT|STUPID SMALL.', sub: 'Do the version you can take back.', cta: 'SHRINK IT' },
  think: { title: 'WOAH.|ONE-WAY|DOOR.', sub: 'This is the one time we use the brain. Put a date on it and ask somebody who knows.', cta: 'SET THAT UP' },
};

export const MOONWALK_LABEL = 'DO A 360 AND MOONWALK AWAY';

export const ONE_WAY_COPY = {
  health: { why: 'This one’s your health. A doctor thinks about this, not an app. We are an app.', move: 'Call the doctor, or write down the one question to ask them.' },
  money: { why: 'This is real money. We don’t yolo real money. Ask somebody with no stake in it.', move: 'Write down the one number you need, then ask somebody with no stake in it.' },
  law: { why: 'This has legal weight. The law does not care that you have no thoughts. Get somebody who knows.', move: 'Find one person who knows this area and send them the question.' },
  safety: { why: 'Somebody could get hurt. This is not a send-it situation.', move: 'Don’t do it today. Call somebody you trust.' },
  life: { why: 'Hard to walk that one back. Thinking is correct here. Put a date on it so it doesn’t go on forever.', move: 'Pick the date you’ll decide by, put it in your calendar and tell one person.' },
};

export const DEFAULT_THINK_MOVE = 'Write down the question, pick a date to decide by and ask somebody who’d know.';

// The first tiny step the fast lane suggests, picked by core.suggestKind from what you typed.
export const MOVE_SUGGESTIONS = {
  draft: 'Send it. Ugly is fine.',
  gym: 'Put your shoes on and go.',
  email: 'Open it and write one ugly sentence.',
  apply: 'Open the application and fill in the first box.',
  clean: 'Clean one surface. Just one.',
  call: 'Dial the number. Say hi.',
  write: 'Write one bad paragraph.',
  default: 'Do the first ugly 10 minutes.',
};

// Draft it ugly: plain messages people can actually send. No jokes in here, these go to real people.
// Write names as "Hey {name}," so a blank name still reads right ("Hey,").
export const DRAFTS = [
  { id: 'reply', label: 'REPLY', subject: 'Getting back to you', variants: [
    'Hey {name}, sorry for the slow reply. I saw your message and wanted to actually answer it. How are you?',
    'Hey {name}! Finally getting back to you. Life got busy, nothing to do with you. What’s new?',
    'Hey {name}, late reply, but I’m here. Are you around this week?',
  ] },
  { id: 'plans', label: 'MAKE PLANS', subject: 'Catching up', variants: [
    'Hey {name}, what are you doing Saturday? Want to grab food?',
    'Hey {name}, it’s been too long. Free for a coffee this week?',
    'Hey {name}, I’m trying to actually see people more. Dinner sometime this week?',
  ] },
  { id: 'askout', label: 'ASK THEM OUT', subject: 'Dinner?', note: 'If it’s a no, say “all good” and leave it there.', variants: [
    'Hey {name}, I’d like to take you out. Are you free for a drink Thursday?',
    'Hey {name}, want to get dinner with me this week? Thursday or Saturday both work.',
  ] },
  { id: 'meeting', label: 'ASK FOR A MEETING', subject: 'Quick chat this week?', variants: [
    'Hi {name}, do you have 20 minutes this week? I’d like your take on something I’m working on.',
    'Hi {name}, could we set up a quick call this week? I want to talk through where I’m at and what’s next.',
  ] },
  { id: 'followup', label: 'FOLLOW UP', subject: 'Following up', variants: [
    'Hi {name}, just following up on my last message. Is there anything else you need from me?',
    'Hi {name}, checking in on this. Still interested, and happy to answer any questions.',
  ] },
  { id: 'apology', label: 'APOLOGIZE', subject: 'I’m sorry', variants: [
    'Hey {name}, I’ve been thinking about what happened. I’m sorry. You didn’t deserve that.',
    'Hey {name}, I owe you an apology. I got that wrong, and I’m sorry. No excuses.',
  ] },
  { id: 'decline', label: 'SAY NO', subject: 'Can’t make it', variants: [
    'Hey {name}, I’m going to pass on this one, but thank you for thinking of me.',
    'Hey {name}, I can’t make it after all. Sorry for the short notice.',
  ] },
  { id: 'refund', label: 'ASK FOR A REFUND', subject: 'Refund request', variants: [
    'Hi, I’d like to request a refund for my recent order. What do you need from me to process it?',
    'Hi, the item I bought didn’t work out for me. Can I get a refund?',
  ] },
  { id: 'favor', label: 'ASK A FAVOR', subject: 'Quick favor', variants: [
    'Hey {name}, could I ask you a favor? Totally fine to say no.',
    'Hey {name}, I could use a hand with something this week. Any chance you’re free for an hour?',
  ] },
  { id: 'reconnect', label: 'RECONNECT', subject: 'Long time', variants: [
    'Hey {name}, you crossed my mind today. How have you been?',
    'Hey {name}, it’s been way too long. What are you up to these days?',
  ] },
  { id: 'issue', label: 'BRING IT UP', subject: 'Quick talk?', variants: [
    'Hey {name}, can we talk about something small before it turns into something big? Nothing dramatic.',
    'Hey {name}, something’s been on my mind and I’d rather just say it. Got a few minutes later?',
  ] },
];

// Tap-to-fill first steps on the fast lane. Five are shown per round.
export const MOVE_CHIPS = [
  'Write one ugly sentence.', 'Send one message.', 'Put my shoes on.', 'Open the thing.', 'Ask one question.',
  'Set a 2-minute timer.', 'Stand up.', 'Make the first click.', 'Say it out loud once.', 'Do the worst part first.',
  'Open a blank page.', 'Find the email address.', 'Put it on the calendar.', 'Clear one square foot.', 'Write the subject line.',
];

export const DREAD = ['Fine', 'Awkward', 'Bad', 'Disaster'];

export const THING_PLACEHOLDERS = [
  'texting them back', 'that email', 'going to the gym', 'posting the video', 'asking for the meeting',
  'replying to the group chat', 'calling the landlord', 'the laundry', 'cancelling that subscription',
  'the first sentence', 'saying hi to the neighbor', 'returning the package', 'booking the haircut',
  'cleaning the kitchen', 'answering the voicemail', 'asking for a raise',
];

// One a day, the same for everyone, collected in the Vault. Add new ones at the end.
export const KOANS = [
  'No dog has ever asked for feedback.',
  'A cat doesn’t circle back.',
  'Fish don’t have a morning routine.',
  'Rocks have never once reconsidered.',
  'The bird doesn’t have a Notion.',
  'The door is a door.',
  'A text is a very small letter.',
  'An email is just typing.',
  'It was always going to be Thursday.',
  'You have legs. They go places.',
  'Send is one button.',
  'Thinking is free. That’s what’s wrong with it.',
  'Either it works or it doesn’t. That’s all of them.',
  'The gym is where the gym is.',
  'Tomorrow is also a day.',
  'Soup is soup.',
  'A duck doesn’t check how the water feels about it.',
  'Pigeons walk into places like they own them.',
  'Toast is just bread that committed.',
  'The kettle boils whether you watch it or not.',
  'A goose has never once apologized.',
  'The sun comes up without a pros and cons list.',
  'Ants carry stuff. That’s the whole job.',
  'Snails get there.',
  'The moon shows up half done.',
  'Rain doesn’t practice.',
  'The squirrel buried it and moved on.',
  'A frog jumps. That’s the frog’s whole thing.',
  'Bread rises. It doesn’t think about it.',
  'Nobody remembers a Tuesday.',
  'The fridge light doesn’t ask why.',
  'Your phone is heavier when the text is unsent.',
  'Mountains don’t wait to feel ready.',
  'A sandwich has never waited for the right time.',
  'Every expert started as someone who just started.',
  'The ocean doesn’t have a backup plan.',
  'Trees grow one ring a year and never post about it.',
  'A lost sock is still a sock somewhere.',
  'Horses don’t have an inner monologue. Probably.',
  'The mailbox doesn’t judge.',
];

export const DONE_LINES = [
  'Go have an orange juice.',
  'Done is done.',
  'That’s it. That was the whole thing.',
  'Not a thought.',
  'Three weeks for that, brother.',
  'The thing is now a thing you did.',
  'Somewhere, a dog is proud of you. He doesn’t know why.',
  'You can stop rehearsing it now.',
  'It happened. History will not be covering it.',
  'Look at you. Doing stuff.',
  'The committee in your head has been dismissed.',
  'No notes.',
  'File it under: over.',
  'Your brain wanted a meeting about this. Denied.',
  'Put it on the fridge.',
  'Wow. Legs and everything.',
  'Nobody clapped. That’s normal. We clapped.',
  'Thinking about it took longer. It always does.',
  'Cross it off. Use a pen. Press hard.',
  'One fewer tab open in your head.',
  'That’s a receipt. Receipts don’t lie.',
  'The raccoon salutes you.',
  'Zero thoughts were harmed.',
  'Next.',
  'Huge. Enormous. Medium, actually. Still counts.',
  'Your future self says thanks. They’re also busy.',
  'Brain empty. Hands full.',
  'Write that down. Actually, don’t. Move on.',
  'Certified smooth.',
  'The overthinker in you has filed a complaint. Ignored.',
  'You did the thing instead of the thinking. Revolutionary.',
  'That’s one less thing to lie awake about.',
];

// Chickening out costs nothing. These say so in different words.
export const BAIL_LINES = [
  'You chickened out. No penalty. Try again when you try again.',
  'Not today. Today is allowed to be not today.',
  'Chickened out. The chicken has been noted. No penalty.',
  'The thing will still be there. It isn’t going anywhere. Neither are you.',
  'Bailing costs nothing in here. Come back when you come back.',
  'Strategic retreat. No penalty.',
  'You looked at it, at least. Looking counts for something. Not much. Something.',
  'Moonwalked away from that one. Allowed.',
];

// Lines aimed at the moment. The first matching context wins; the rest fall back to DONE_LINES.
// `always: true` contexts beat a generic line every time; the others win about half the time.
export const CONTEXT_LINES = {
  first: { always: true, lines: ['Your first receipt. Frame it. Don’t actually frame it.', 'First one. That was the hard part. That was also the only part.'] },
  streak3: { always: true, lines: ['Three days in a row. That’s a pattern now.'] },
  streak7: { always: true, lines: ['A full week. Your brain is filing for unemployment.'] },
  streak14: { always: true, lines: ['Two weeks straight. The committee in your head has been disbanded.'] },
  streak30: { always: true, lines: ['Thirty days. You are now the raccoon in the helmet.'] },
  back: { always: true, lines: ['You came back. The brain missed you. It won’t say so.', 'Welcome back. Nothing happened while you were gone. Nothing ever does.'] },
  daily: { lines: ['Mission complete. Everyone got the same one. You actually did it.', 'Today’s mission: handled. The rest of the day is a bonus.', 'The mission was the mission. Done.'] },
  quick: { lines: ['Under a minute. The worrying took longer than the doing.', 'Faster than a microwave burrito.', 'That took less time than reading this.', 'Blink and you did it.'] },
  late: { lines: ['Middle of the night and you did a thing. Now sleep.', 'Night shift complete. Go to bed, legend.', 'It’s late. The thing is done. The brain can clock out.'] },
  early: { lines: ['Done before 8 a.m. Disgusting. Well done.', 'Done before breakfast. The day can’t touch you now.', 'Early bird. The worm never saw it coming.'] },
  monday: { lines: ['Did a thing on a Monday. Monday hates that.', 'Monday, handled. The rest of the week is scared now.'] },
  friday: { lines: ['Friday, and you still did it. Unhinged. Respect.', 'Did a thing on a Friday. The weekend is earned.'] },
  weekend: { lines: ['Did a thing on the weekend. Nobody even made you.', 'Weekend thing, done. Back to lying down.'] },
  dare: { always: true, lines: ['The wheel said do it. You did it. Respect the wheel.', 'Dare accepted. Dare completed. The wheel is pleased.', 'You let a wheel run your life for five minutes. It worked.'] },
};

// How often an everyday moment line beats a generic one. Low, so small pools don't wear out.
export const MOMENT_ODDS = 0.35;

// ---------- the wardrobe ----------
// Drawn in brain.js. Pieces drop as you finish things, in an order shuffled per person,
// and they're never announced ahead of time: the surprise is the point.
export const WARDROBE_INFO = [
  { id: 'partyhat', name: 'PARTY HAT', line: 'For no reason. That’s the best reason.' },
  { id: 'helmet', name: 'RACING HELMET', line: 'For the waterslide. You know the one.' },
  { id: 'crown', name: 'CROWN', line: 'King of doing it before thinking about it.' },
  { id: 'propeller', name: 'PROPELLER CAP', line: 'Spins faster than your thoughts now.' },
  { id: 'sweatband', name: 'SWEATBAND', line: 'You’re not sweating. The brain is.' },
  { id: 'chefhat', name: 'CHEF HAT', line: 'Cooking. Not thinking. Cooking.' },
  { id: 'headphones', name: 'HEADPHONES', line: 'Can’t hear the overthinking. Too loud in here.' },
  { id: 'cowboy', name: 'COWBOY HAT', line: 'Yeehaw is a complete thought.' },
  { id: 'bow', name: 'BOW', line: 'Gift-wrapped. Present tense.' },
  { id: 'cone', name: 'TRAFFIC CONE', line: 'Found it. Wearing it. No further questions.' },
  { id: 'mustache', name: 'MUSTACHE', line: 'Distinguished. Has never once reconsidered.' },
  { id: 'halo', name: 'HALO', line: 'A smooth brain is a holy brain.' },
];

// Finished things (bails don't count here) at which a new piece drops.
export const DRIP_AT = [1, 3, 5, 8, 11, 15, 19, 24, 29, 35, 42, 50];

// Tap the brain on the home screen.
export const POKE_LINES = [
  'Brother.',
  'Not a thought in here. Check.',
  'Ow. Go do the thing.',
  'I’m busy doing nothing.',
  'Poke me again. I dare you.',
  'Soup.',
  'You’re stalling. I can tell.',
  'Hi. Bye. Go.',
  'I had a thought once. Didn’t like it.',
  'That tickles. Do something.',
  'Echo… echo… echo…',
  'Fully loaded. Nothing in it.',
  'Still Thursday in here.',
  'Do I look smoother to you?',
  'Rent-free. Nobody else lives here.',
  'Beep. Boop. Go outside.',
  'I’m not a stress ball. Well. Okay.',
  'The raccoon says hi.',
  'You poked me. That’s an action. Proud of you.',
  'Thinking about thinking about it? No.',
];

// Spin a dare: small, safe and silly. Mixed with the open mission packs.
export const DARES = [
  'Say “brother” out loud to nobody.',
  'Text someone “thinking of you” with no context.',
  'Reply to the oldest unread message you have.',
  'Do five squats right now.',
  'Make your bed. Badly.',
  'Take the stairs once today.',
  'Put one thing back where it goes.',
  'Send a voice memo instead of a text.',
  'Stand outside for 60 seconds. That’s it.',
  'Delete one app you never open.',
  'Ask someone how their day actually was.',
  'Wipe your phone screen. You know why.',
  'Throw away one thing from your bag.',
  'Drink a glass of water like it’s a toast.',
  'Write tomorrow’s first task on a sticky note.',
  'High-five a doorframe on your way out.',
  'Open the app you’ve been avoiding. Just open it.',
  'Unsubscribe from one email list.',
  'Compliment the next dog you see. Out loud.',
  'Water a plant. Any plant. Yours.',
];

// Shown while the clock runs, one at a time.
export const TIMER_LINES = [
  'Thoughts: zero. Keep it there.',
  'You’re doing it. That’s the whole thing.',
  'Nobody is watching. Keep going.',
  'The brain is buffering. Good.',
  'This is the part where you don’t stop.',
  'Overthinking has left the building.',
  'Still going. Look at you.',
  'Hands busy. Head empty.',
  'If it’s ugly, it counts.',
  'Somewhere a dog is rooting for you.',
  'Done beats good. Keep it moving.',
  'The committee is on break.',
  'Don’t check. Just keep doing.',
  'The raccoon is in the cart. The cart is moving.',
  'You can decide later. You’re busy.',
  'Small step. Then the next one.',
  'Zero thoughts. Full send.',
  'This is what Thursday is for.',
  'You don’t need a plan. You need a minute.',
  'Brother. You’re doing it.',
];

// Daily nudges in the iPhone app. No guilt, no owl threats.
export const NUDGE_LINES = [
  'One tiny thing. Then you’re free.',
  'Today’s mission is small. Like, really small.',
  'Your brain is getting wrinkly. One move smooths it.',
  'The thing you’re avoiding takes nine seconds.',
  'Not a thought. Just one move.',
  'Brother. One thing.',
  'Spin a dare. Let the wheel decide.',
  'The raccoon is waiting in the cart.',
  'Something new might drop today. Go find out.',
  'Five minutes. Then you can go back to nothing.',
  'Ugly and done beats perfect and later.',
  'Today’s koan is up. So are you, probably.',
];

// Each round of the fast lane gets its own color, so no two rounds look alike.
export const THEMES = ['sun', 'pink', 'blue', 'lime', 'orange'];

// Rare: about 1 receipt in 20 comes out gold with one of these. Collected in the Vault.
export const RARE_LINES = [
  'A raccoon in a helmet just slid past and saluted.',
  'Somewhere, a spreadsheet you never made breathes a sigh of relief.',
  'For one second your brain was fully smooth. It felt like soup.',
  'The committee in your head has been dissolved. Nobody showed up to object.',
  'A dog somewhere did nothing at all today and is still proud of you.',
  'Monday called. It wants to know your secret.',
  'You have been promoted to Thing Doer, First Class.',
  'A pigeon walked into a bank today with this exact energy.',
  'Even the orange juice is impressed.',
  'This receipt is printed in gold. It isn’t. But imagine.',
  'Soup is soup. And you are you. Wow.',
];

// The "whiny objection, deadpan answer" format is the signature joke of the source videos.
// Written to stay safe for anything: these are about texts and gyms, never about real stakes.
export const OBJECTIONS = [
  { q: 'But what if they don’t text back?', a: 'THEN THEY|DON’T TEXT|BACK, BROTHER.' },
  { q: 'But what if it goes badly?', a: 'THEN IT|WENT BADLY.|STILL TUESDAY.' },
  { q: 'But what if I look stupid?', a: 'NOBODY|IS LOOKING|AT YOU.' },
  { q: 'But I’m not ready.', a: 'NOBODY|ASKED.' },
  { q: 'But I should do more research.', a: 'THE DOG|DID NO|RESEARCH.' },
  { q: 'But what will people think?', a: 'THEY WON’T.|THAT’S THE WHOLE|PROBLEM WITH PEOPLE.' },
  { q: 'But what if there’s a better option?', a: 'THERE IS.|EAT THE|TACO.' },
  { q: 'But I need a plan.', a: 'YOU DO IT.|THEN IT’S DONE.|THAT’S THE PLAN.' },
  { q: 'But it’s not the right time.', time: true },
  { q: 'But what if I fail?', a: 'THEN YOU|DID SOMETHING.|HUGE UPGRADE.' },
  { q: 'But I’m tired.', a: 'HAVE AN|ORANGE|JUICE.' },
  { q: 'But what if it’s awkward?', a: 'IT LASTS|NINE|SECONDS.' },
  { q: 'But what does it all mean?', a: 'IT MEANS|THURSDAY.' },
  { q: 'But the reviews are mixed.', a: 'IT’S|SOUP.' },
  { q: 'But I could just start Monday.', a: 'MONDAY|IS A|MYTH.' },
  { q: 'But my friend said…', a: 'YOUR FRIEND|IS ALSO|SCARED.' },
  { q: 'But I might regret it.', a: 'YOU REGRET IT|ALREADY AND YOU|HAVEN’T DONE IT.' },
  { q: 'But I made a spreadsheet.', a: 'WE|KNOW.' },
  { q: 'But what if I’m overthinking this?', a: 'BROTHER.' },
  { q: 'But what if they say no?', a: 'THEN YOU|KNOW.|CONGRATS.' },
  { q: 'But I don’t know how.', a: 'NOBODY DID.|THEN THEY|DID.' },
  { q: 'But it has to be perfect.', a: 'IT WON’T BE.|SEND IT|ANYWAY.' },
  { q: 'But what if they’re busy?', a: 'THEN THEY|ANSWER|LATER.' },
  { q: 'But I already waited too long.', a: 'NOW IS LESS|LATE THAN|LATER.' },
  { q: 'But what if I’m bad at it?', a: 'YOU ARE.|EVERYONE IS.|AT FIRST.' },
  { q: 'But I need to feel motivated.', a: 'MOTIVATION|SHOWS UP|AFTER.' },
  { q: 'But what if it’s weird?', a: 'WEIRD|IS FINE.|BIRDS ARE WEIRD.' },
  { q: 'But I’m waiting for a sign.', a: 'THIS IS|THE SIGN.|HI.' },
  { q: 'But I don’t have the energy.', a: 'IT’S ONE|BUTTON.' },
  { q: 'But what if they think I’m annoying?', a: 'ONE TEXT|IS NOT|ANNOYING.' },
  { q: 'But I need to think about it.', a: 'YOU HAVE.|FOR WEEKS.|WE CHECKED.' },
  { q: 'But what if I mess up the wording?', a: 'WORDS|ARE|FREE.' },
  { q: 'But it’s been so long.', a: 'SO IT’S|BEEN LONG.|SAY HI.' },
];

export const PLAYBOOKS = [
  { id: 'work', name: 'WORK', moves: [
    'Send the email you keep rewriting. As is.',
    'Ask the question you think is dumb.',
    'Show the rough version to one person.',
    'Ask for the meeting. One sentence.',
    'Apply to one job. Don’t tailor anything.',
    'Pick a date to decide about your job. Don’t decide today.',
  ] },
  { id: 'dating', name: 'DATING', moves: [
    'Ask them out. One sentence, a day and a place.',
    'Say hi to someone you keep noticing. Just hi.',
    'Answer the message you’ve been ignoring.',
    'Book the second date now.',
    'Tell them you had a good time.',
    'If you hear no, say “all good” and leave it there.',
  ] },
  { id: 'friends', name: 'FRIENDS', moves: [
    'Text someone: “what are you doing Saturday?”',
    'Send the “saw this and thought of you.”',
    'Call someone instead of texting.',
    'Say the annoying thing while it’s still small.',
    'Introduce yourself to a neighbor.',
    'Apologize for the thing. No essay.',
  ] },
  { id: 'body', name: 'BODY', moves: [
    'Put your shoes on and go outside. That’s the workout.',
    'Do ten push-ups. Knees count.',
    'Walk for ten minutes with no headphones.',
    'Go to the gym and do anything. No program.',
    'Set an alarm for bedtime tonight.',
    'Book the checkup you keep putting off.',
  ] },
  { id: 'cash', name: 'MONEY', moves: [
    'Cancel one subscription you keep “deciding” about.',
    'Look at your bank balance. Just look.',
    'Move $10 to savings.',
    'Open the bill you’ve been avoiding.',
    'Ask for the refund.',
    'Write down what you owe. One list. Nothing else.',
  ] },
  { id: 'home', name: 'HOME', moves: [
    'Clean one surface.',
    'Throw away three things.',
    'Start the laundry.',
    'Fix the thing that takes five minutes.',
    'Cook the easy thing.',
    'Make the phone call you’ve been dodging.',
  ] },
  { id: 'making', name: 'MAKING STUFF', moves: [
    'Post the rough version.',
    'Write one bad paragraph.',
    'Record one take. Don’t listen back.',
    'Show someone the unfinished thing.',
    'Tell someone what you’re making.',
    'Make the ugly first version.',
  ] },
];

const WILD_CARDS = [
  'Say good morning to a stranger.',
  'Compliment someone out loud.',
  'Take a different way home.',
  'Meow at a cat. If it meows back, that’s a good sign.',
  'Drink an orange juice. Then do the thing.',
];

export const MOVES = [...PLAYBOOKS.flatMap((p) => p.moves), ...WILD_CARDS];

// act: 'loop' starts the door check, 'check' the loop check, 'dump' the brain dump.
export const LESSONS = [
  {
    id: 'chew',
    rule: 'THINKING IS|NOT DOING.',
    why: 'You thought about the gym for 40 minutes. The gym does not know. Research on rumination ties going in circles to worse mood and worse problem-solving.',
    test: 'Did your last round of thinking add a fact, change an option or make the next step clearer? If not, you were chewing.',
    cta: { label: 'RUN THE LOOP CHECK', act: 'check' },
    src: 'Watkins & Roberts, 2020',
  },
  {
    id: 'doors',
    rule: 'MOST DOORS|SWING BOTH|WAYS.',
    why: 'It’s a door, brother. If it’s bad in there, come back out. Most decisions can be undone, so they don’t need much thought.',
    test: 'If this goes bad, can you try again next week? Then why are we still here?',
    cta: { label: 'CHECK A DOOR', act: 'door' },
    src: 'Two-way doors: Amazon 2015 shareholder letter',
  },
  {
    id: 'shrink',
    rule: 'MAKE IT|STUPID|SMALL.',
    why: 'You are not writing the book. You are writing one bad sentence. Possibly the word “the.” Small moves tell you things that thinking can’t.',
    test: 'If it takes more than ten minutes, it’s still too big.',
    cta: { label: 'SHRINK SOMETHING', act: 'loop' },
  },
  {
    id: 'when',
    rule: 'DECIDE WHEN,|NOT WHETHER.',
    why: '“When lunch ends, I send it.” That’s the whole technology. A plan with a trigger beats a good intention.',
    test: 'Finish the sentence: when ___, I will ___.',
    cta: { label: 'MAKE A PLAN', act: 'loop' },
    src: 'Gollwitzer, 1999; Gollwitzer & Sheeran, 2006',
  },
  {
    id: 'forecast',
    rule: 'YOUR BRAIN|IS A LIAR.',
    why: '29 students with generalized anxiety tracked their worries. 91.4% of the predictions didn’t come true. That’s one small study and they aren’t you, so we’re keeping score on yours.',
    test: 'Predict how bad it’ll go. Then check. Your brain has a record now.',
    cta: { label: 'CATCH IT LYING', act: 'loop' },
    src: 'LaFreniere & Newman, 2020',
  },
  {
    id: 'spotlight',
    rule: 'NOBODY IS|LOOKING AT|YOU.',
    why: 'Scientists put students in an embarrassing T-shirt. They overestimated how many people could say what was on it. That’s a real study. Everyone’s busy worrying about their own shirt.',
    test: 'Go be awkward. Nine seconds, tops.',
    cta: { label: 'DO THE AWKWARD THING', act: 'loop' },
    src: 'Gilovich, Medvec & Savitsky, 2000',
  },
  {
    id: 'legs',
    rule: 'YOU HAVE|LEGS.',
    why: 'When your thoughts start circling, don’t argue with them. Walk. Do ten push-ups. Or dump it all out. It won’t solve anything, but it changes the channel.',
    test: 'This one’s a practice, not a study. Try it and see.',
    cta: { label: 'EMPTY MY HEAD', act: 'dump' },
  },
  {
    id: 'end',
    rule: 'AT THE END|OF THE DAY,|IT’S THE END|OF THE DAY.',
    why: 'The day ended. You can stop trying the case. Keep the one useful thing and move on. Punishing yourself isn’t the same as working on it.',
    test: 'That’s why chickening out costs nothing in here.',
    cta: { label: 'BACK TO IT', act: 'home' },
  },
  {
    id: 'think',
    rule: 'KNOW WHEN|TO USE THE|BRAIN.',
    why: 'Doctors, contracts, real money, somebody’s safety, other people’s lives. That’s what the brain is for. We saved it for this. Go slow and ask somebody who knows.',
    test: 'One-way door? The smart move is the slow one.',
    cta: { label: 'CHECK A DOOR', act: 'door' },
  },
];

// Days of doing stuff (bails count) before each law and mission pack opens. 0 = open from the start.
// "Know when to use the brain" stays open from day one: it's the safety one.
export const UNLOCK_DAYS = {
  lessons: { chew: 0, doors: 0, shrink: 0, when: 1, forecast: 3, spotlight: 5, legs: 8, end: 12, think: 0 },
  packs: { work: 0, home: 0, friends: 2, body: 4, dating: 7, cash: 10, making: 14 },
};

export const CHECK_QS =['ADD A|NEW FACT?', 'CHANGE YOUR|OPTIONS?', 'MAKE THE NEXT|STEP CLEARER?'];
