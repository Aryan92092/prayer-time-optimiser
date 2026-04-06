/**
 * Client-side schedule generator — matches the backend seed data structure.
 * Generates activity entries based on user profile (religion × stress × role × time).
 */

const getDetailedGuideMap = () => ({
    hindu: {
        morning: {
            title: 'Morning Aarti',
            reference: 'Offer light to the Divine. Chant Gayatri Mantra 3x.',
            detail_guide: [
                'Find a clean, quiet space.',
                'Light a diya or candle.',
                'Sit comfortably and take 3 deep breaths.',
                'Chant OM 3 times to center yourself.',
                'Recite the Gayatri Mantra 3 times slowly.',
                'Offer gratitude for a new day.'
            ],
            mantra_lyrics: "Om Bhur Bhuva Swaha\nTat Savitur Varenyam\nBhargo Devasya Dhimahi\nDhiyo Yo Nah Prachodayat"
        },
        afternoon: {
            title: 'Gita Reflection',
            reference: 'Bhagavad Gita Chapter 2, Shlokas 47–51 (Karma Yoga)',
            detail_guide: [
                'Read Shloka 47: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action."',
                'Close your eyes and reflect on what this means for your current work or studies.',
                'Let go of anxiety about grades or outcomes.',
                'Commit to doing your best for the rest of the day simply as an offering.'
            ],
            mantra_lyrics: "Karmanye vadhikaraste Ma Phaleshu Kadachana,\nMa Karmaphalaheturbhurma Te Sangostvakarmani\n\n(You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.)"
        },
        evening: {
            title: 'Mantra Meditation',
            reference: 'Om Namah Shivaya — 108 repetitions',
            detail_guide: [
                'Sit in a comfortable position with your spine straight.',
                'Hold your mala (if you have one) in your right hand.',
                'Breathe in deeply. As you exhale, internally chant "Om Namah Shivaya".',
                'Repeat 108 times, focusing only on the sound of the mantra.',
                'If your mind wanders, gently bring it back to the chant.'
            ],
            mantra_lyrics: "Om Namah Shivaya\n(I bow to Shiva, the supreme reality, the inner self)"
        },
        night: {
            title: 'Evening Seva',
            reference: 'Offer flowers or recite Shri Ram Stuti',
            detail_guide: [
                'Wash your face and hands.',
                'Offer a fresh flower or simply bow at your altar.',
                'Recite the Shri Ram Stuti or simply say "Thank you, Divine, for this day."',
                'Mentally surrender all your worries of the day to the Divine before sleeping.'
            ],
            mantra_lyrics: "Shri Ram Chandra Kripalu Bhajman,\nHaran Bhava Bhaya Darunam|\nNav Kanj Lochan, Kanj Mukh,\nKar Kanj, Pad Kanjarunam||"
        }
    },
    muslim: {
        morning: {
            title: 'Morning Remembrance',
            reference: 'Surah Al-Fatiha + Surah Al-Ikhlas (3x)',
            detail_guide: [
                'Begin in the name of Allah (Bismillah).',
                'Recite Surah Al-Fatiha slowly, reflecting on its meaning as a prayer for guidance.',
                'Recite Surah Al-Ikhlas 3 times (equivalent to reciting a third of the Quran).',
                'Make silent du’a for a productive and peaceful day.'
            ],
            mantra_lyrics: "Bismillaahir Rahmaanir Raheem\nAlhamdu lillaahi Rabbil 'aalameen\nAr-Rahmaanir-Raheem\nMaaliki Yawmid-Deen\nIyyaaka na'budu wa lyyaaka nasta'een\nIhdinas-Siraatal-Mustaqeem\nSiraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen"
        },
        afternoon: {
            title: 'Dhuhr Focus',
            reference: 'Surah Al-Baqarah 2:286 — Recite & Reflect',
            detail_guide: [
                'Pause your work/studies.',
                'Recite or read the translation of 2:286: "Allah does not burden a soul beyond that it can bear..."',
                'Remind yourself that whatever stress you are facing right now, you have the strength to handle it.',
                'Take 5 deep breaths before returning to your tasks.'
            ],
            mantra_lyrics: "La yukallifullahu nafsan illa wus'aha\nLaha ma kasabat wa 'alayha maktasabat\nRabbana la tu'akhithna in nasina aw akhta'na...\n\n(Allah does not burden a soul beyond that it can bear...)"
        },
        evening: {
            title: 'Asr Gratitude',
            reference: 'Evening Dhikr: SubhanAllah, Alhamdulillah, Allahu Akbar (33x)',
            detail_guide: [
                'Sit quietly for 5 minutes.',
                'Say SubhanAllah (Glory be to Allah) 33 times.',
                'Say Alhamdulillah (Praise be to Allah) 33 times.',
                'Say Allahu Akbar (Allah is the Greatest) 34 times.',
                'Feel the physical tension release with each repetition.'
            ],
            mantra_lyrics: "SubhanAllah (Glory be to Allah)\nAlhamdulillah (Praise be to Allah)\nAllahu Akbar (Allah is the greatest)"
        },
        night: {
            title: 'Isha Reflection',
            reference: 'Surah Al-Mulk (67) Reading',
            detail_guide: [
                'Before getting into bed, read or listen to Surah Al-Mulk.',
                'Reflect on the majesty of creation and the insignificance of worldly anxieties.',
                'Forgive anyone who wronged you today.',
                'Go to sleep with a clean heart.'
            ],
            mantra_lyrics: "Tabaarakal lazee biyadihil mulku wa huwa 'alaa kulli shai-in qadeer.\nAl lazee khalaqal mawta wal hayaata liyabluwakum ayyukum ahsanu 'amalaa;\nwa huwal 'azeezul ghafoor...\n\n(Blessed is He in whose hand is dominion, and He is over all things competent...)"
        }
    },
    sikh: {
        morning: {
            title: 'Morning Nitnem',
            reference: 'Japji Sahib — Ang 1–8',
            detail_guide: [
                'Cover your head and sit respectfully.',
                'Read or listen to the first 8 Pauris (stanzas) of Japji Sahib.',
                'Focus on the concept of Hukam (Divine Will).',
                'Accept that today is unfolding exactly as it should according to the Creator’s plan.'
            ],
            mantra_lyrics: "Ik oankar satnam Karta purakh nirbhau nirvair Akal murat ajuni saibhang gurprasad.\nJap.\nAad sach jugad sach.\nHai bhi sach Nanak hosi bhi sach.\n\n(One Universal Creator God. The Name Is Truth. Creative Being Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru's Grace ~)"
        },
        afternoon: {
            title: 'Simran Meditation',
            reference: 'Waheguru Simran — 10 minutes',
            detail_guide: [
                'Find a quiet place to sit.',
                'Close your eyes and breathe deeply.',
                'Inhale while mentally reciting "Wahe", exhale while reciting "Guru".',
                'Continue for 10 minutes, letting the sound vibration clear your mind of stress.'
            ],
            mantra_lyrics: "Waheguru (Inhale: Wahe, Exhale: Guru)\n(Wondrous Enlightener, who ends the darkness of ignorance)"
        },
        evening: {
            title: 'Kirtan Peace',
            reference: 'Listen to Anand Sahib — Ang 917',
            detail_guide: [
                'Play an audio recording of Anand Sahib (The Song of Bliss).',
                'Close your eyes and simply absorb the soothing music and words.',
                'Reflect on how true bliss comes from within, not from external achievements.'
            ],
            mantra_lyrics: "Anand bhaia meri mae satiguru mai paia.\nSatigur ta paia sahaj seti mani vajia vadhaiia.\nRag ratan parvar paria sabad gavan aia.\nSabado ta gavahu hari kera mani jini vasaia.\nKahai nanaku anandu hoa satiguru mai paia.\n\n(I am in ecstasy, O my mother, for I have found my True Guru...)"
        },
        night: {
            title: 'Nightly Reflection',
            reference: 'Evening Prayer (Rehras Sahib) focus',
            detail_guide: [
                'Reflect on your day through the lens of Chardi Kala (ever-rising optimism).',
                'Acknowledge any mistakes made today without harsh self-judgment.',
                'Express gratitude for the Gurus’ teachings.',
                'Rest peacefully knowing you are under Divine protection.'
            ],
            mantra_lyrics: "Tudhaage ardaas humaari jeeo pind sabh tera.\nKahu Nanak sabh tayree vadi-aa-ee ko-ee naa-o na jaanai mayraa.\n\n(I offer my prayer to You; my body and soul are all Yours. Says Nanak, this is all Your greatness; no one even knows my name.)"
        }
    },
    christian: {
        morning: {
            title: 'Morning Devotional',
            reference: 'Psalm 23 — Read & Meditate',
            detail_guide: [
                'Read Psalm 23 slowly: "The Lord is my shepherd; I shall not want..."',
                'Identify which verse speaks to you most today.',
                'Sit in silence for 3 minutes, letting that truth sink into your heart.',
                'Pray a short prayer asking for God’s guidance today.'
            ],
            mantra_lyrics: "The Lord is my shepherd; I shall not want.\nHe maketh me to lie down in green pastures: he leadeth me beside the still waters.\nHe restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.\nYea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me;\nthy rod and thy staff they comfort me."
        },
        afternoon: {
            title: 'Midday Anchor',
            reference: 'Matthew 6:25–34 (Do not be anxious)',
            detail_guide: [
                'Pause your work.',
                'Read Christ’s words about the birds of the air and the lilies of the field.',
                'List 3 worries you are currently carrying.',
                'Physically open your hands and imagine handing those 3 worries over to God.',
                'Return to work with a lighter spirit.'
            ],
            mantra_lyrics: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.\n\nLook at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?"
        },
        evening: {
            title: 'Prayer of Hope',
            reference: 'Philippians 4:6–7',
            detail_guide: [
                'Read: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."',
                'Spend 5 minutes thanking God for specific things that happened today.',
                'Present any remaining anxieties from the day to Him.',
                'Ask for the "peace that transcends all understanding" to guard your heart tonight.'
            ],
            mantra_lyrics: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.\nAnd the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."
        },
        night: {
            title: 'Resting in Him',
            reference: 'Hymn of Calm: "Be Still My Soul"',
            detail_guide: [
                'Listen to or read the lyrics of the hymn "Be Still My Soul".',
                'Focus on the line: "The Lord is on thy side; Bear patiently the cross of grief or pain..."',
                'Let go of the day’s burdens.',
                'Rest in the knowledge that you are loved unconditionally.'
            ],
            mantra_lyrics: "Be still, my soul: the Lord is on thy side;\nBear patiently the cross of grief or pain;\nLeave to thy God to order and provide;\nIn every change He faithful will remain.\nBe still, my soul: thy best, thy heavenly Friend\nThrough thorny ways leads to a joyful end."
        }
    },
    judaism: {
        morning: {
            title: "Shacharit",
            reference: "Morning Prayer",
            detail_guide: ["Wash hands (Netilat Yadayim).", "Recite the Modeh Ani to thank God for waking up.", "Recite the Shema Yisrael.", "Reflect on bringing holiness into the day's actions."],
            mantra_lyrics: "Shema Yisrael Adonai Eloheinu Adonai Echad"
        },
        afternoon: {
            title: "Mincha",
            reference: "Afternoon Prayer",
            detail_guide: ["Pause midday activities.", "Recite the Amidah (standing prayer).", "Take a moment of personal reflection.", "Express gratitude for the day's blessings thus far."],
            mantra_lyrics: "Oseh shalom bimromav..."
        },
        evening: {
            title: "Maariv",
            reference: "Evening Prayer",
            detail_guide: ["Recite the evening Shema.", "Reflect on the day's events.", "Seek peace for the night."],
            mantra_lyrics: "Hashkiveinu Adonai Eloheinu l'shalom"
        },
        night: {
            title: "Bedtime Shema",
            reference: "Nighttime Reflection",
            detail_guide: ["Read the Bedtime Shema.", "Forgive anyone who may have wronged you today.", "Prepare your mind for restful sleep."],
            mantra_lyrics: "B'yado afkid ruchi..."
        }
    },
    bahai: {
        morning: {
            title: "Morning Obligatory Prayer",
            reference: "Short Obligatory Prayer",
            detail_guide: ["Wash face and hands.", "Turn towards the Qiblih.", "Recite the short obligatory prayer.", "Reflect on your purpose to know and worship God."],
            mantra_lyrics: "I bear witness, O my God, that Thou hast created me to know Thee and to worship Thee..."
        },
        afternoon: {
            title: "Reflection and Service",
            reference: "Midday Reflection",
            detail_guide: ["Pause for a few minutes of quiet reflection.", "Consider how your work serves humanity.", "Strive to translate spiritual principles into action."],
            mantra_lyrics: "Make my prayer, O my Lord, a fountain of living waters..."
        },
        evening: {
            title: "Evening Reading",
            reference: "Reading the Writings",
            detail_guide: ["Read a passage from the Bahá'í writings.", "Reflect deeply on its meaning.", "Consider how to apply it tomorrow."],
            mantra_lyrics: "O Son of Spirit! My first counsel is this..."
        },
        night: {
            title: "Nightly Accounting",
            reference: "Self-Reflection",
            detail_guide: ["Review your day's deeds.", "Hold yourself accountable for your actions.", "Ask for forgiveness and strive to do better."],
            mantra_lyrics: "Bring thyself to account each day ere thou art summoned to a reckoning..."
        }
    },
    druze: {
        morning: {
            title: "Morning Reflection",
            reference: "Awakening of the Mind",
            detail_guide: ["Reflect on the unity of God.", "Set an intention for truthfulness in your words today.", "Appreciate the life granted to you."],
            mantra_lyrics: "Praise be to the One, the Eternal."
        },
        afternoon: {
            title: "Community & Truth",
            reference: "Midday Pause",
            detail_guide: ["Contemplate the principle of mutual support.", "Ensure your actions today align with truth.", "Breathe deeply and center yourself."],
            mantra_lyrics: "In truth and wisdom we find our path."
        },
        evening: {
            title: "Evening Meditation",
            reference: "Quiet Contemplation",
            detail_guide: ["Withdraw from worldly noise.", "Reflect on the esoteric wisdom of nature.", "Quiet the mind."],
            mantra_lyrics: "May wisdom guide my heart."
        },
        night: {
            title: "Rest in Wisdom",
            reference: "Nightly Peace",
            detail_guide: ["Release the day's burdens.", "Trust in divine justice.", "Sleep with a pure and calm heart."],
            mantra_lyrics: "Infinite peace in the Divine Will."
        }
    },
    samaritanism: {
        morning: {
            title: "Morning Supplication",
            reference: "Facing Mount Gerizim",
            detail_guide: ["Turn towards Mount Gerizim.", "Recite morning prayers acknowledging God's oneness.", "Ask for guidance in following the Torah."],
            mantra_lyrics: "Shema Israel..."
        },
        afternoon: {
            title: "Midday Torah Study",
            reference: "Torah Reflection",
            detail_guide: ["Read a portion of the Samaritan Torah.", "Reflect on its teachings.", "Apply the laws to your daily conduct."],
            mantra_lyrics: "Blessed is the True Judge."
        },
        evening: {
            title: "Evening Prayer",
            reference: "Dusk Supplication",
            detail_guide: ["Face Mount Gerizim again.", "Offer prayers of gratitude for the day.", "Reflect on your adherence to the commandments."],
            mantra_lyrics: "Praise be to God always."
        },
        night: {
            title: "Night Reflection",
            reference: "Peaceful Sleep",
            detail_guide: ["Acknowledge the Creator before sleeping.", "Rest your mind.", "Trust in divine protection."],
            mantra_lyrics: "Under the wings of the Almighty."
        }
    },
    buddhism: {
        morning: {
            title: "Mindfulness Meditation",
            reference: "Morning Sitting",
            detail_guide: ["Sit in a comfortable posture.", "Focus on your breath.", "Observe thoughts without judgment.", "Set a mindful intention for the day."],
            mantra_lyrics: "Om Mani Padme Hum"
        },
        afternoon: {
            title: "Reading Teachings of Buddha",
            reference: "Dharma Study",
            detail_guide: ["Read a passage from the Dhammapada.", "Reflect on impermanence.", "Practice mindful walking or working."],
            mantra_lyrics: "Namo Tassa Bhagavato..."
        },
        evening: {
            title: "Loving Kindness Meditation",
            reference: "Metta Bhavana",
            detail_guide: ["Sit quietly.", "Generate feelings of love and compassion.", "Wish well for all sentient beings."],
            mantra_lyrics: "May all beings be happy and peaceful."
        },
        night: {
            title: "Releasing Attachments",
            reference: "Nightly Review",
            detail_guide: ["Reflect on the day's events.", "Notice any clinging or aversion.", "Let go of these attachments.", "Rest peacefully."],
            mantra_lyrics: "Letting go..."
        }
    },
    jainism: {
        morning: {
            title: "Morning Namokar Mantra",
            reference: "Greeting the Day",
            detail_guide: ["Recite the Namokar Mantra.", "Reflect on the virtues of enlightened souls.", "Vow to practice Ahimsa (non-violence) today."],
            mantra_lyrics: "Namo Arihantanam, Namo Siddhanam..."
        },
        afternoon: {
            title: "Midday Mindfulness",
            reference: "Ahimsa Practice",
            detail_guide: ["Ensure your meals and actions harm no living beings.", "Practice equanimity (Samayika).", "Reflect on truthfulness (Satya)."],
            mantra_lyrics: "Non-violence is the highest religion."
        },
        evening: {
            title: "Evening Pratikramana",
            reference: "Repentance",
            detail_guide: ["Reflect on any harm you may have caused today.", "Seek forgiveness from all living beings.", "Vow not to repeat mistakes."],
            mantra_lyrics: "Micchami Dukkadam (May all the evil that has been done be fruitless)."
        },
        night: {
            title: "Nightly Calm",
            reference: "Rest in the Soul",
            detail_guide: ["Detach from worldly possessions mentally.", "Focus on the pure nature of your soul.", "Sleep with a calm and non-violent mind."],
            mantra_lyrics: "Peace to all beings."
        }
    },
    ayyavazhi: {
        morning: {
            title: "Morning Ukappadippu",
            reference: "Sunrise Prayer",
            detail_guide: ["Face the sun or light a lamp.", "Recite the Ukappadippu.", "Reflect on the ultimate oneness of God.", "Seek eradication of Kali (evil) within."],
            mantra_lyrics: "Ayya Sive Raman..."
        },
        afternoon: {
            title: "Midday Charity",
            reference: "Anna Dharmam",
            detail_guide: ["Share food or resources with someone in need.", "Reflect on equality and brotherhood.", "Perform your duties with humility."],
            mantra_lyrics: "Service to humanity is service to God."
        },
        evening: {
            title: "Evening Thiruvasakam",
            reference: "Dusk Prayer",
            detail_guide: ["Sing or listen to hymns.", "Offer gratitude.", "Seek inner purity."],
            mantra_lyrics: "O Ayya, guide us to the path of Dharma."
        },
        night: {
            title: "Night Contemplation",
            reference: "Rest in Ayya",
            detail_guide: ["Reflect on the day.", "Surrender your ego.", "Rest in divine peace."],
            mantra_lyrics: "Peace, Ayya."
        }
    },
    taoism: {
        morning: {
            title: "Morning Qigong",
            reference: "Aligning with the Tao",
            detail_guide: ["Perform gentle stretching or Qigong.", "Focus on your breath (Qi).", "Observe the flow of nature.", "Embrace simplicity for the day."],
            mantra_lyrics: "Wu Wei (Effortless Action)."
        },
        afternoon: {
            title: "Midday Stillness",
            reference: "Zuowang (Sitting in Oblivion)",
            detail_guide: ["Sit quietly for a few minutes.", "Empty your mind of complex thoughts.", "Harmonize with your environment."],
            mantra_lyrics: "The Tao that can be told is not the eternal Tao."
        },
        evening: {
            title: "Evening Reflection on Nature",
            reference: "Observing the Yin",
            detail_guide: ["Observe the transition from day to night.", "Reflect on balance (Yin and Yang).", "Release forceful actions and let things be."],
            mantra_lyrics: "Yield and overcome."
        },
        night: {
            title: "Returning to the Source",
            reference: "Peaceful Sleep",
            detail_guide: ["Calm your vital energy.", "Rest without desires or worries.", "Return to the natural state of rest."],
            mantra_lyrics: "Returning to the root is stillness."
        }
    },
    confucianism: {
        morning: {
            title: "Morning Respect",
            reference: "Xiao (Filial Piety)",
            detail_guide: ["Show respect to your elders or ancestors.", "Set an intention to be honest and sincere today.", "Prepare your mind for learning."],
            mantra_lyrics: "What you do not wish for yourself, do not do to others."
        },
        afternoon: {
            title: "Midday Self-Cultivation",
            reference: "Ren (Humaneness)",
            detail_guide: ["Reflect on your interactions with others today.", "Ensure you act with propriety (Li).", "Read a passage from the Analects."],
            mantra_lyrics: "To study and at due times practice what one has studied, is this not a pleasure?"
        },
        evening: {
            title: "Evening Reflection",
            reference: "Threefold Daily Introspection",
            detail_guide: ["Ask yourself: Have I been loyal to others?", "Have I been trustworthy to my friends?", "Have I practiced what I have been taught?"],
            mantra_lyrics: "I examine myself three times a day."
        },
        night: {
            title: "Rest in Virtue",
            reference: "Peace of Mind",
            detail_guide: ["Reflect on a life of moral harmony.", "Let go of resentment.", "Rest to prepare for another day of duty."],
            mantra_lyrics: "Harmony is the most valuable."
        }
    },
    shinto: {
        morning: {
            title: "Morning Misogi",
            reference: "Purification",
            detail_guide: ["Wash your face and hands mindfully.", " Bow twice, clap twice, bow once to greet the Kami.", "Express gratitude for the morning sun."],
            mantra_lyrics: "Harae-tamae kiyome-tamae (Purify and cleanse)."
        },
        afternoon: {
            title: "Midday Gratitude",
            reference: "Appreciating Nature",
            detail_guide: ["Take a moment to appreciate nature (a tree, the sky, a plant).", "Acknowledge the Kami in all living things.", "Eat your meal with deep gratitude (Itadakimasu)."],
            mantra_lyrics: "Thank you for the blessings of nature."
        },
        evening: {
            title: "Evening Shrine Visit / Bow",
            reference: "Dusk Reverence",
            detail_guide: ["Reflect on the day's blessings.", "Express gratitude for safety and health.", "Offer a silent prayer for harmony."],
            mantra_lyrics: "Kannagara tamachihaemase."
        },
        night: {
            title: "Nightly Cleansing",
            reference: "Inner Purity",
            detail_guide: ["Bathe and wash away the day's impurities (Tsumi).", "Clear your mind of negative thoughts.", "Sleep with a pure heart (Makoto)."],
            mantra_lyrics: "Rest in purity."
        }
    },
    chinese_folk: {
        morning: {
            title: "Morning Incense",
            reference: "Honoring Ancestors",
            detail_guide: ["Light incense at your home altar.", "Offer tea or fruit to the deities or ancestors.", "Ask for protection and guidance for the family."],
            mantra_lyrics: "Respects to Heaven, Earth, and Ancestors."
        },
        afternoon: {
            title: "Midday Harmony",
            reference: "Balancing Elements",
            detail_guide: ["Ensure harmony in your workspace.", "Act according to the natural seasons.", "Remember the wisdom of your elders."],
            mantra_lyrics: "Harmony brings wealth."
        },
        evening: {
            title: "Evening Gratitude",
            reference: "Thanking the Local Deities",
            detail_guide: ["Reflect on the day's successes safely.", "Thank the local earth god (Tudigong) for stability.", "Enjoy dinner with family, fostering connection."],
            mantra_lyrics: "Gratitude for peace and safety."
        },
        night: {
            title: "Nightly Rest",
            reference: "Yin Time",
            detail_guide: ["Close the doors and secure the home.", "Calm the mind, respecting the transition to Yin time.", "Rest peacefully."],
            mantra_lyrics: "Rest in the protection of the ancestors."
        }
    },
    tenrikyo: {
        morning: {
            title: "Morning Service",
            reference: "Joyous Life",
            detail_guide: ["Perform the morning service with hand movements.", "Sweep away the 'eight mental dusts' (miserliness, covetousness, etc.).", "Set an intention to live a Joyous Life."],
            mantra_lyrics: "Ashiki o harote tasuke tamae, Tenri-O-no-Mikoto."
        },
        afternoon: {
            title: "Hinokishin",
            reference: "Daily Contribution",
            detail_guide: ["Perform an act of voluntary, joyful service for someone else.", "Clean a public space, or help a colleague.", "Do it without expecting a reward."],
            mantra_lyrics: "Joyous life through helping others."
        },
        evening: {
            title: "Evening Service",
            reference: "Gratitude to God the Parent",
            detail_guide: ["Perform the evening service.", "Thank God the Parent for the day's blessings and the use of your body.", "Reflect on how much 'dust' you accumulated today."],
            mantra_lyrics: "Thank you for lending me this body."
        },
        night: {
            title: "Rest in the Parent",
            reference: "Peaceful Sleep",
            detail_guide: ["Return your mind to a state of purity.", "Trust in God the Parent's providence.", "Sleep peacefully."],
            mantra_lyrics: "Rest safely in the embrace of God the Parent."
        }
    },
    african_traditional: {
        morning: {
            title: "Morning Libation",
            reference: "Greeting the Ancestors",
            detail_guide: ["Pour a small libation (water) on the earth.", "Call upon the ancestors to guide your steps today.", "Ask for wisdom and strength for the community."],
            mantra_lyrics: "We stand on the shoulders of those who came before us."
        },
        afternoon: {
            title: "Midday Ubuntu",
            reference: "Community Connection",
            detail_guide: ["Reflect on 'I am because we are'.", "Check in on a family member or friend.", "Ensure your actions benefit the collective."],
            mantra_lyrics: "Ubuntu - I am because you are."
        },
        evening: {
            title: "Evening Storytelling",
            reference: "Wisdom Exchange",
            detail_guide: ["Reflect on the lessons the day has taught you.", "Share stories or wisdom with family or friends.", "Honor the cycle of life."],
            mantra_lyrics: "Wisdom is like a baobab tree; no one individual can embrace it."
        },
        night: {
            title: "Nightly Protection",
            reference: "Resting with Spirit",
            detail_guide: ["Ask the ancestors to watch over your home.", "Release daily worries to the Creator.", "Rest peacefully."],
            mantra_lyrics: "May the spirits guide our dreams."
        }
    },
    native_american: {
        morning: {
            title: "Greeting the Sun",
            reference: "Morning Prayer",
            detail_guide: ["Face the East as the sun rises.", "Offer tobacco or a quiet prayer.", "Give thanks to the Creator for a new day.", "Honor the Four Directions."],
            mantra_lyrics: "Walk in Harmony."
        },
        afternoon: {
            title: "Connection to the Earth",
            reference: "Midday Grounding",
            detail_guide: ["Spend a few moments outside touching the earth or a tree.", "Remember your connection to all living things (All My Relations).", "Act with respect for nature's balance."],
            mantra_lyrics: "Mitakuye Oyasin (All My Relations)."
        },
        evening: {
            title: "Evening Gratitude",
            reference: "Giving Thanks",
            detail_guide: ["Reflect on the gifts the Earth provided today (food, water, shelter).", "Give thanks to the animal and plant spirits.", "Center your mind."],
            mantra_lyrics: "Thank you, Creator, for the gifts of this day."
        },
        night: {
            title: "Dreamtime Preparation",
            reference: "Nightly Peace",
            detail_guide: ["Smudge with sage or cedar (or visualize cleansing).", "Release negative energy.", "Ask for guidance in your dreams."],
            mantra_lyrics: "Rest in the Great Mystery."
        }
    },
    australian_aboriginal: {
        morning: {
            title: "Acknowledging Country",
            reference: "Morning Connection",
            detail_guide: ["Acknowledge the traditional custodians of the land you are on.", "Pay respects to Elders past and present.", "Feel the connection to the earth beneath your feet."],
            mantra_lyrics: "Respect for Country."
        },
        afternoon: {
            title: "Listening to the Land",
            reference: "Deep Listening (Dadirri)",
            detail_guide: ["Practice Dadirri—inner, deep listening and quiet, still awareness.", "Observe the nature around you without judgment.", "Feel the spirit of the land."],
            mantra_lyrics: "Listen to the earth."
        },
        evening: {
            title: "Dreaming Reflection",
            reference: "Evening Story",
            detail_guide: ["Reflect on the stories of creation and your place in them.", "Consider how your actions today cared for Country.", "Share time with kin."],
            mantra_lyrics: "We are part of the Dreaming."
        },
        night: {
            title: "Nightly Rest",
            reference: "Peace on Country",
            detail_guide: ["Let the quiet of the night settle your spirit.", "Trust in the ancient ongoing life of the land.", "Rest."],
            mantra_lyrics: "Sleep on Country."
        }
    },
    maori: {
        morning: {
            title: "Morning Karakia",
            reference: "Greeting the Dawn",
            detail_guide: ["Recite a morning Karakia (prayer/incantation).", "Acknowledge Ranginui (Sky Father) and Papatuanuku (Earth Mother).", "Set a positive intention (Kaupapa) for the day."],
            mantra_lyrics: "Whakataka te hau ki te uru..."
        },
        afternoon: {
            title: "Midday Whanaungatanga",
            reference: "Building Connection",
            detail_guide: ["Focus on connecting with others.", "Show Manaakitanga (hospitality/kindness) to someone.", "Uphold your community's wellbeing."],
            mantra_lyrics: "Aroha mai, aroha atu."
        },
        evening: {
            title: "Evening Reflection",
            reference: "Closing the Day",
            detail_guide: ["Reflect on your actions today.", "Ensure your Mauri (life force) is balanced.", "Give thanks for the day's learnings."],
            mantra_lyrics: "Kia ora."
        },
        night: {
            title: "Nightly Tapu",
            reference: "Sacred Rest",
            detail_guide: ["Acknowledge the sacredness (Tapu) of rest.", "Clear your mind to restore energy.", "Sleep peacefully."],
            mantra_lyrics: "Moe mai ra."
        }
    },
    shamanism: {
        morning: {
            title: "Calling the Directions",
            reference: "Morning Invocation",
            detail_guide: ["Honor the East, South, West, North, Above, and Below.", "Call upon your spirit guides or power animals.", "Ask for clear vision for the day's journey."],
            mantra_lyrics: "Spirits of the East, bring fresh beginnings..."
        },
        afternoon: {
            title: "Midday Grounding",
            reference: "Nature Connection",
            detail_guide: ["Connect with the elements (Earth, Water, Air, Fire).", "Feel the energy of the earth rising into your body.", "Maintain spiritual equilibrium."],
            mantra_lyrics: "I am rooted as the tree."
        },
        evening: {
            title: "Shamanic Journeying/Reflection",
            reference: "Evening Trance",
            detail_guide: ["Listen to rhythmic drumming or sit in silence.", "Retrieve any fragmented energy scattered during the day.", "Release energy that is not yours to carry."],
            mantra_lyrics: "Returning to wholeness."
        },
        night: {
            title: "Dream Incubation",
            reference: "Nightly Rest",
            detail_guide: ["Ask your guides a question to answer in your dreams.", "Protect your energy field.", "Enter the dreamtime with intention."],
            mantra_lyrics: "Guide my spirit as I sleep."
        }
    },
    amazonian: {
        morning: {
            title: "Jungle Awakening",
            reference: "Greeting the Forest",
            detail_guide: ["Acknowledge the spirits of the plants and animals.", "Drink water mindfully, thanking the rivers.", "Ask the forest for strength and vitality."],
            mantra_lyrics: "Life flows like the river."
        },
        afternoon: {
            title: "Plant Medicine Connection",
            reference: "Midday Stillness",
            detail_guide: ["Take a moment to appreciate any food or herbs you consume.", "Reflect on the interconnected web of the jungle.", "Walk with a soft footprint."],
            mantra_lyrics: "We are woven into the forest."
        },
        evening: {
            title: "Icaro / Song Reflection",
            reference: "Evening Healing",
            detail_guide: ["Hum a healing melody or sit in quiet reflection.", "Call back your spirit to your body.", "Offer gratitude to the earth."],
            mantra_lyrics: "Heal the body, heal the mind."
        },
        night: {
            title: "Resting with the Spirits",
            reference: "Peaceful Sleep",
            detail_guide: ["Ask the plant spirits for protection.", "Allow the sounds of nature (real or imagined) to lull you.", "Rest deeply."],
            mantra_lyrics: "Safe in the canopy."
        }
    },
    inuit: {
        morning: {
            title: "Morning Breath",
            reference: "Greeting the Cold",
            detail_guide: ["Take a deep breath of crisp morning air.", "Acknowledge Sila (the weather/spirit of the air).", "Set your intention for resilience today."],
            mantra_lyrics: "Breathe the spirit of the wind."
        },
        afternoon: {
            title: "Community Sharing",
            reference: "Midday Kinship",
            detail_guide: ["Reflect on how your work benefits your family/community.", "Share knowledge or resources.", "Respect the animals that sustain you."],
            mantra_lyrics: "We survive together."
        },
        evening: {
            title: "Evening Story",
            reference: "Oral Tradition",
            detail_guide: ["Reflect on the wisdom of the elders.", "Appreciate the warmth of your shelter.", "Ensure the community is safe."],
            mantra_lyrics: "The ice provides, the community thrives."
        },
        night: {
            title: "Rest in the Dark",
            reference: "Nightly Peace",
            detail_guide: ["Find comfort in the long darkness.", "Rest your body for tomorrow's hunt/work.", "Sleep peacefully."],
            mantra_lyrics: "Safe under the Northern Lights."
        }
    },
    pacific_island: {
        morning: {
            title: "Morning Ocean Greeting",
            reference: "Greeting the Moana",
            detail_guide: ["Face the direction of the sea.", "Breathe deeply, synchronizing with the waves.", "Acknowledge the ancestors who navigated the oceans."],
            mantra_lyrics: "The ocean connects us all."
        },
        afternoon: {
            title: "Midday Aloha / Talofa",
            reference: "Spirit of Love",
            detail_guide: ["Show hospitality and love to someone.", "Work in harmony with your completely (Ohana/Aiga).", "Maintain a joyful spirit."],
            mantra_lyrics: "Live with Aloha."
        },
        evening: {
            title: "Evening Gratitude",
            reference: "Dusk Reflection",
            detail_guide: ["Reflect on the abundance of the land and sea.", "Thank the Creator for your family.", "Enjoy quiet time as the sun sets."],
            mantra_lyrics: "Gratitude for the island's bounty."
        },
        night: {
            title: "Nightly Rest",
            reference: "Peaceful Sleep",
            detail_guide: ["Listen to the sound of the wind or water.", "Let go of the day's worries.", "Rest surrounded by ancestral love."],
            mantra_lyrics: "Moe malie (Sleep well)."
        }
    },
    zoroastrianism: {
        morning: {
            title: "Prayer to Ahura Mazda",
            reference: "Kusti Prayer",
            detail_guide: ["Tie the Kusti (sacred cord) if you wear one.", "Face a source of light (the sun or fire).", "Pray to Ahura Mazda for wisdom and purity today."],
            mantra_lyrics: "Ashem Vohu (Good righteousness is the best of all good)."
        },
        afternoon: {
            title: "Reflection on Good Thoughts, Good Deeds",
            reference: "Humata, Hukhta, Hvarshta",
            detail_guide: ["Pause and review your actions today.", "Are your thoughts good? Are your words kind? Are your deeds righteous?", "Adjust your course if needed."],
            mantra_lyrics: "Good Thoughts, Good Words, Good Deeds."
        },
        evening: {
            title: "Gratitude Prayer",
            reference: "Evening Fire",
            detail_guide: ["Light a candle or fire.", "Offer gratitude for the triumph of light over dark.", "Reflect on your part in the cosmic battle for truth."],
            mantra_lyrics: "Righteousness is the best good."
        },
        night: {
            title: "Nightly Purity",
            reference: "Restful Peace",
            detail_guide: ["Cleanse yourself before sleep.", "Ask Ahura Mazda to guard your soul during the night.", "Sleep peacefully."],
            mantra_lyrics: "May the light protect."
        }
    },
    yazidism: {
        morning: {
            title: "Morning Face the Sun",
            reference: "Greeting Tawûsê Melek",
            detail_guide: ["Face the sun at dawn.", "Recite morning prayers.", "Ask for guidance and protection from Tawûsê Melek."],
            mantra_lyrics: "Praise to the angels."
        },
        afternoon: {
            title: "Midday Purity",
            reference: "Maintaining Tradition",
            detail_guide: ["Ensure your actions respect the earth and elements.", "Avoid speaking ill of others.", "Stay true to your community values."],
            mantra_lyrics: "Walk with a pure heart."
        },
        evening: {
            title: "Evening Reflection",
            reference: "Dusk Prayer",
            detail_guide: ["Face the setting sun.", "Reflect on the day's deeds.", "Give thanks for the light."],
            mantra_lyrics: "The light returns."
        },
        night: {
            title: "Rest in Grace",
            reference: "Nightly Peace",
            detail_guide: ["Rest knowing you are under divine protection.", "Clear your mind of worries.", "Sleep."],
            mantra_lyrics: "Peace to the community."
        }
    },
    manichaeism: {
        morning: {
            title: "Greeting the Light",
            reference: "Morning Release",
            detail_guide: ["Acknowledge the Divine Light trapped in the material world.", "Set an intention to liberate the Light through pure actions.", "Eat mindfully, avoiding harm."],
            mantra_lyrics: "Liberate the Light."
        },
        afternoon: {
            title: "Midday Asceticism",
            reference: "Purity of Action",
            detail_guide: ["Practice the 'Three Seals' (mouth, hands, breast).", "Avoid lying, harming living beings, and impure thoughts.", "Focus on spiritual knowledge."],
            mantra_lyrics: "Seal your actions with purity."
        },
        evening: {
            title: "Evening Confession",
            reference: "Daily Repentance",
            detail_guide: ["Confess any harm done to the Light today.", "Seek forgiveness.", "Renew your commitment to the path of Light."],
            mantra_lyrics: "Forgive my transgressions against the Light."
        },
        night: {
            title: "Restful Return",
            reference: "Nightly Peace",
            detail_guide: ["Detach from worldly illusions.", "Prepare the soul for its ultimate return to the Realm of Light.", "Sleep."],
            mantra_lyrics: "Return to the Light."
        }
    },
    zurvanism: {
        morning: {
            title: "Acknowledging Infinite Time",
            reference: "Morning Reflection",
            detail_guide: ["Reflect on Zurvan, the god of infinite time.", "Acknowledge that all things are bound by time.", "Use your time wisely today."],
            mantra_lyrics: "Time is infinite."
        },
        afternoon: {
            title: "Midday Balance",
            reference: "Navigating Duality",
            detail_guide: ["Observe the interplay of light and dark in the world.", "Strive to align with the light.", "Accept what you cannot change."],
            mantra_lyrics: "Balance the cosmic forces."
        },
        evening: {
            title: "Evening Fate Reflection",
            reference: "Resignation to Destiny",
            detail_guide: ["Review the day's events.", "Accept that some things are dictated by fate.", "Find peace in the passage of time."],
            mantra_lyrics: "Time reveals all."
        },
        night: {
            title: "Rest in Eternity",
            reference: "Nightly Peace",
            detail_guide: ["Let go of temporal anxieties.", "Surrender to the infinite.", "Sleep."],
            mantra_lyrics: "Rest in boundless time."
        }
    },
    scientology: {
        morning: {
            title: "Morning Assessment",
            reference: "Checking the Tone Scale",
            detail_guide: ["Assess your current emotional tone.", "Set an intention to move upscale today.", "Visualize a successful day of production."],
            mantra_lyrics: "Survive!"
        },
        afternoon: {
            title: "Midday Processing",
            reference: "Removing Enturbulation",
            detail_guide: ["Notice if your environment is enturbulated.", "Use TRs (Training Routines) to maintain presence.", "Stay focused on your targets."],
            mantra_lyrics: "Be here now."
        },
        evening: {
            title: "Evening Wins",
            reference: "Writing Up Successes",
            detail_guide: ["Write down your wins for the day.", "Acknowledge what you produced.", "Let go of any ARC breaks."],
            mantra_lyrics: "Acknowledge your wins."
        },
        night: {
            title: "Exteriorization Reflection",
            reference: "Nightly Rest",
            detail_guide: ["Recognize yourself as a spiritual being (Thetan).", "Release attachment to the physical body's stresses.", "Sleep peacefully."],
            mantra_lyrics: "You are a spiritual being."
        }
    },
    raelism: {
        morning: {
            title: "Morning Sensual Meditation",
            reference: "Awakening the Senses",
            detail_guide: ["Perform a sensual meditation.", "Appreciate the creation of the Elohim.", "Embrace love and scientific understanding."],
            mantra_lyrics: "Love and Science."
        },
        afternoon: {
            title: "Midday Peace",
            reference: "Spreading Harmony",
            detail_guide: ["Promote peace and non-violence in your interactions.", "Reflect on infinity.", "Enjoy your current experience fully."],
            mantra_lyrics: "Embrace infinity."
        },
        evening: {
            title: "Evening Reflection",
            reference: "Extraterrestrial Connection",
            detail_guide: ["Look at the stars.", "Feel connected to the creators.", "Appreciate your existence."],
            mantra_lyrics: "We are connected to the stars."
        },
        night: {
            title: "Restful Sleep",
            reference: "Nightly Peace",
            detail_guide: ["Relax your mind.", "Trust in scientific advancement and human potential.", "Sleep."],
            mantra_lyrics: "Rest in the cosmos."
        }
    },
    falun_gong: {
        morning: {
            title: "Morning Exercises",
            reference: "Cultivation of Mind and Body",
            detail_guide: ["Perform the standing exercises (e.g., Falun Standing Stance).", "Focus on Truthfulness, Compassion, and Forbearance.", "Clear your mind."],
            mantra_lyrics: "Zhen, Shan, Ren (Truthfulness, Compassion, Forbearance)."
        },
        afternoon: {
            title: "Midday Reading",
            reference: "Studying the Fa",
            detail_guide: ["Read a section of Zhuan Falun.", "Reflect on how to apply the principles to any conflict today.", "Look inward to find your own shortcomings."],
            mantra_lyrics: "Look within."
        },
        evening: {
            title: "Evening Sitting Meditation",
            reference: "Strengthening Divine Powers",
            detail_guide: ["Sit in the lotus position.", "Perform the sitting meditation.", "Attain a state of tranquility."],
            mantra_lyrics: "Tranquility of mind."
        },
        night: {
            title: "Nightly Reflection",
            reference: "Releasing Attachments",
            detail_guide: ["Review your thoughts from the day.", "Release any worldly attachments or resentments.", "Sleep peacefully."],
            mantra_lyrics: "Let go of attachments."
        }
    },
    unification_church: {
        morning: {
            title: "Morning Pledge",
            reference: "Family Pledge",
            detail_guide: ["Recite the Family Pledge (or reflect on true family values).", "Determine to live for the sake of others today.", "Honor God as the Heavenly Parent."],
            mantra_lyrics: "Live for the sake of others."
        },
        afternoon: {
            title: "Midday True Love",
            reference: "Practicing Heart",
            detail_guide: ["Practice 'True Love' in your workplace or school.", "Give without expecting a return.", "Overcome any barriers between yourself and others."],
            mantra_lyrics: "True love gives and forgets."
        },
        evening: {
            title: "Evening Gratitude",
            reference: "Reflecting on Blessings",
            detail_guide: ["Thank Heavenly Parent for the experiences of the day.", "Reflect on how you contributed to the Kingdom of Heaven on Earth.", "Spend quality time with family."],
            mantra_lyrics: "Gratitude to Heaven."
        },
        night: {
            title: "Nightly Rest",
            reference: "Peace in the Family",
            detail_guide: ["Release negative emotions.", "Pray for the establishment of peace.", "Sleep restfully."],
            mantra_lyrics: "Peace begins in the family."
        }
    },
    eckankar: {
        morning: {
            title: "Morning HU Chant",
            reference: "Singing HU",
            detail_guide: ["Sit quietly and close your eyes.", "Take a deep breath and sing 'HU' on the exhale.", "Listen for the Sound and look for the Light of God.", "Sing for 15-20 minutes."],
            mantra_lyrics: "HUUUUUUUUUU..."
        },
        afternoon: {
            title: "Midday Contemplation",
            reference: "Spiritual Exercises",
            detail_guide: ["Take a short break.", "Recognize divine love working in your life right now.", "Operate from a state of spiritual freedom."],
            mantra_lyrics: "I am Soul."
        },
        evening: {
            title: "Evening Review",
            reference: "Reviewing the Day",
            detail_guide: ["Reflect on any spiritual insights or coincidences today.", "Recognize the guidance of the Mahanta.", "Journal your experiences."],
            mantra_lyrics: "Divine spirit guides my steps."
        },
        night: {
            title: "Nightly Soul Travel",
            reference: "Dream Preparation",
            detail_guide: ["Ask for spiritual instruction during your sleep.", "Prepare yourself to explore the inner planes.", "Sing HU briefly before sleeping."],
            mantra_lyrics: "May the Mahanta guide my dreams."
        }
    },
    atheism: {
        morning: {
            title: "Gratitude Reflection",
            reference: "Starting with Purpose",
            detail_guide: ["Take a deep breath.", "Reflect on the improbable luck of being alive.", "Set a rational goal to improve yourself or the world today."],
            mantra_lyrics: "The meaning of life is what we give it."
        },
        afternoon: {
            title: "Purpose and Productivity",
            reference: "Midday Focus",
            detail_guide: ["Pause and review your tasks.", "Ensure your actions align with your personal values.", "Take a moment to appreciate human ingenuity and science."],
            mantra_lyrics: "Action guided by reason."
        },
        evening: {
            title: "Self Evaluation",
            reference: "Evening Rationality",
            detail_guide: ["Evaluate your day using logic and reason.", "Acknowledge mistakes as learning opportunities.", "Express gratitude to the people who helped you today."],
            mantra_lyrics: "Reason, empathy, and growth."
        },
        night: {
            title: "Nightly Disconnect",
            reference: "Restful Sleep",
            detail_guide: ["Accept that you have done what you could today.", "Let go of anxieties about things out of your control.", "Sleep well to rest your brain."],
            mantra_lyrics: "Embrace the quiet."
        }
    },
    agnosticism: {
        morning: {
            title: "Embracing Mystery",
            reference: "Morning Wonder",
            detail_guide: ["Look out the window and appreciate the complexity of the universe.", "Accept that not all questions need immediate answers.", "Cultivate curiosity for the day ahead."],
            mantra_lyrics: "Wonder in the unknown."
        },
        afternoon: {
            title: "Midday Observation",
            reference: "Mindful Inquiry",
            detail_guide: ["When faced with stress, ask yourself: 'What do I actually know is true here?'", "Separate facts from assumptions.", "Breathe deeply into the present moment."],
            mantra_lyrics: "Question with an open mind."
        },
        evening: {
            title: "Evening Comfort",
            reference: "Peace with Ambiguity",
            detail_guide: ["Reflect on the things you learned today.", "Find comfort in the fact that humanity is still exploring and learning.", "Journal any interesting questions that arose."],
            mantra_lyrics: "Comfort in the journey of asking."
        },
        night: {
            title: "Nightly Rest",
            reference: "Mental Relaxation",
            detail_guide: ["Release the need for absolute certainty.", "Let your mind relax into peaceful sleep.", "Rest."],
            mantra_lyrics: "Rest in the grand mystery."
        }
    },
    humanism: {
        morning: {
            title: "Intention Setting",
            reference: "Morning Compassion",
            detail_guide: ["Reflect on human dignity.", "Set an intention to act with compassion, empathy, and fairness today.", "Remember that you have the power to make someone's life better."],
            mantra_lyrics: "Act with compassion and reason."
        },
        afternoon: {
            title: "Helping Others / Ethical Reflection",
            reference: "Midday Action",
            detail_guide: ["Perform a small act of kindness.", "Evaluate if your current work is contributing positively to society.", "Take a moment to appreciate art or human connection."],
            mantra_lyrics: "Good without god."
        },
        evening: {
            title: "Reflection on Daily Actions",
            reference: "Evening Review",
            detail_guide: ["Ask yourself: 'Did I decrease suffering or increase well-being today?'", "Acknowledge your positive impact, no matter how small.", "Forgive yourself for human errors."],
            mantra_lyrics: "Strive for human flourishing."
        },
        night: {
            title: "Nightly Optimism",
            reference: "Restful Sleep",
            detail_guide: ["Reflect on the progress of humanity.", "Trust in human potential.", "Rest to recharge your capacity for empathy."],
            mantra_lyrics: "Hope in humanity."
        }
    },
    stoicism: {
        morning: {
            title: "Morning Premeditatio Malorum",
            reference: "Preparation for Adversity",
            detail_guide: ["Remind yourself that you will meet difficult people and situations today.", "Resolve to respond with virtue (Wisdom, Courage, Justice, Temperance).", "Focus only on what is within your control."],
            mantra_lyrics: "Some things are in our control and others not."
        },
        afternoon: {
            title: "The View from Above",
            reference: "Midday Perspective",
            detail_guide: ["When stressed, imagine zooming out to see your city, the earth, and the cosmos.", "Realize how small your current problem is in the grand scheme.", "Return to your duties with tranquility."],
            mantra_lyrics: "Amor Fati (Love your fate)."
        },
        evening: {
            title: "Evening Retrospection",
            reference: "Seneca's Review",
            detail_guide: ["Ask: What ailment did I cure today? What failing did I resist?", "Review the day without judgment, acting as a compassionate judge to yourself.", "Note how to improve tomorrow."],
            mantra_lyrics: "Memento Mori (Remember you must die)."
        },
        night: {
            title: "Nightly Surrender",
            reference: "Releasing Control",
            detail_guide: ["Accept that the day is done.", "Relinquish control over the past and the future.", "Sleep peacefully, ready for whatever tomorrow brings."],
            mantra_lyrics: "Accept what you cannot change."
        }
    },
    existentialism: {
        morning: {
            title: "Embracing Freedom",
            reference: "Creating Meaning",
            detail_guide: ["Acknowledge your radical freedom to choose your actions today.", "Take responsibility for the meaning you create in your life.", "Act authentically, not in 'bad faith'."],
            mantra_lyrics: "Existence precedes essence."
        },
        afternoon: {
            title: "Midday Authenticity",
            reference: "Overcoming Angst",
            detail_guide: ["If feeling anxiety, recognize it as the dizziness of freedom.", "Recommit to an action that feels true to your self-created values.", "Fully engage with the present moment."],
            mantra_lyrics: "Condemned to be free."
        },
        evening: {
            title: "Evening Responsibility",
            reference: "Owning the Day",
            detail_guide: ["Reflect on the choices you made today.", "Accept that you are the sum of your actions.", "Feel the weight but also the joy of being the author of your life."],
            mantra_lyrics: "I am my choices."
        },
        night: {
            title: "Nightly Reflection",
            reference: "Peaceful Sleep",
            detail_guide: ["Accept the absurdity of the universe.", "Find peace in your own defined purpose.", "Rest to create again tomorrow."],
            mantra_lyrics: "Imagine Sisyphus happy."
        }
    },
    none: {
        morning: {
            title: 'Mindful Start',
            reference: '4-7-8 Breathing Technique',
            detail_guide: [
                'Sit comfortably with your back straight.',
                'Inhale quietly through your nose for 4 seconds.',
                'Hold your breath for 7 seconds.',
                'Exhale completely through your mouth, making a whoosh sound, for 8 seconds.',
                'Repeat this cycle 4 times to deeply calm your nervous system for the day ahead.'
            ],
            mantra_lyrics: "Inhale (4 seconds)\nHold Breath (7 seconds)\nExhale (8 seconds)\n\n(Repeat 4 times)"
        },
        afternoon: {
            title: 'Midday Reset',
            reference: '5-4-3-2-1 Grounding Method',
            detail_guide: [
                'Pause what you are doing.',
                'Look around and name 5 things you can see.',
                'Name 4 things you can physically feel.',
                'Name 3 things you can hear.',
                'Name 2 things you can smell.',
                'Name 1 thing you can taste.',
                'This pulls you out of anxiety and back into the present moment.'
            ],
            mantra_lyrics: "5 things you can see\n4 things you can touch\n3 things you can hear\n2 things you can smell\n1 thing you can taste\n\n(Sensory Grounding)"
        },
        evening: {
            title: 'Gratitude Reflection',
            reference: 'The "Three Good Things" Exercise',
            detail_guide: [
                'Take a piece of paper or open a journal.',
                'Write down 3 specific things that went well today.',
                'For each one, write one sentence explaining *why* it went well or why it mattered.',
                'Allow yourself to feel the positive emotion associated with those memories.'
            ],
            mantra_lyrics: "What went well today?\n\n1. __________________ \n2. __________________ \n3. __________________"
        },
        night: {
            title: 'Deep Relaxation',
            reference: 'Progressive Muscle Relaxation',
            detail_guide: [
                'Lie down in bed.',
                'Starting with your toes, tense the muscles as tightly as you can for 5 seconds.',
                'Release the tension suddenly and completely. Notice the feeling of relaxation.',
                'Move up to your calves, tense for 5 seconds, then release.',
                'Continue moving up through your thighs, stomach, arms, shoulders, and finally your face.',
                'Allow yourself to drift to sleep.'
            ],
            mantra_lyrics: "Tense for 5 seconds.\nRelease and feel the heaviness.\nMove up the body slowly.\nToes -> Ankles -> Calves -> Knees -> Thighs -> Stomach -> Chest -> Shoulders -> Hands -> Face."
        }
    }
});

const getDetailedGuide = (religion, time) => {
    const guides = getDetailedGuideMap();
    const relKey = guides[religion] ? religion : 'none';
    return guides[relKey][time];
};

export const getGuideByTitle = (title) => {
    if (!title) return null;
    const t = title.toLowerCase().trim();
    const guides = getDetailedGuideMap();
    for (const rel in guides) {
        for (const time in guides[rel]) {
            const guideTitle = guides[rel][time].title.toLowerCase().trim();
            // Bidirectional match: handle cases where DB title or guide title is a subset
            if (t.includes(guideTitle) || guideTitle.includes(t) || t === guideTitle) {
                return guides[rel][time];
            }
        }
    }
    return null;
};

const timesOfDay = ['morning', 'afternoon', 'evening', 'night'];

/**
 * Generate schedule entries for a program.
 * @param {Object} profile - { spiritual_preference, religion_type, stress_level, user_role }
 * @param {string} programId - UUID of the program
 * @param {string} userId - UUID of the user
 * @param {Date} startDate - start date
 * @param {number} totalDays - total number of days
 * @returns {Array} entries ready to insert into schedule_entries table
 */
export const generateScheduleEntries = (profile, programId, userId, startDate, totalDays) => {
    const religion = profile.spiritual_preference === 'non-religious' ? 'none' : profile.religion_type || 'none';
    const entries = [];

    for (let day = 1; day <= totalDays; day++) {
        for (let t = 0; t < timesOfDay.length; t++) {
            const time = timesOfDay[t];
            const guide = getDetailedGuide(religion, time);

            entries.push({
                program_id: programId,
                user_id: userId,
                day_number: day,
                time_of_day: time,
                activity_title: guide.title,
                activity_description: `Tailored for your wellbeing today.`,
                reference: guide.reference,
                detail_guide: guide.detail_guide,
                mantra_lyrics: guide.mantra_lyrics,
                completed: false,
            });
        }
    }

    return entries;
};

/** Pure client-side: check if day N is locked because Day N-1 is incomplete */
export const isDayLocked = (entries, dayNumber) => {
    if (dayNumber <= 1) return false;
    const prevDayEntries = entries.filter((e) => e.day_number === dayNumber - 1);
    const incompletePrevDay = prevDayEntries.some((e) => !e.completed);
    return incompletePrevDay;
};

/** Pure client-side: compute streak from entries array */
export const computeStreak = (entries) => {
    const days = {};
    entries.forEach((e) => {
        if (!days[e.day_number]) days[e.day_number] = [];
        days[e.day_number].push(e.completed);
    });

    let streak = 0;
    for (const day of Object.keys(days).sort((a, b) => a - b)) {
        if (days[day].every((v) => v === true)) streak++;
        else break;
    }
    return streak;
};

/** Pure client-side: compute insights */
export const computeInsights = (entries) => {
    const total = entries.length;
    let completed = 0;

    // Count exact completions vs totals safely
    const uniqueEntries = new Set();
    entries.forEach(e => {
        if (!uniqueEntries.has(e.id)) {
            uniqueEntries.add(e.id);
            if (e.completed) completed++;
        }
    });

    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    const streak = computeStreak(entries);

    let level = 'Beginner';
    let message = 'Start strong. Small steps build momentum.';
    if (completionPercentage >= 25) { level = 'Growing'; message = "You're building consistency. Keep going!"; }
    if (completionPercentage >= 50) { level = 'Consistent'; message = "You're doing great. Discipline is forming."; }
    if (completionPercentage >= 75) { level = 'Strong'; message = "Amazing progress. You're becoming unstoppable!"; }
    if (completionPercentage === 100) { level = 'Master'; message = 'You completed your program. Incredible discipline!'; }

    return { completionPercentage, streak, level, message };
};

/** Pure client-side: last 7 days weekly progress */
export const computeWeeklyProgress = (entries, startDate) => {
    const progressByDay = {};
    entries.forEach((e) => {
        if (!progressByDay[e.day_number]) progressByDay[e.day_number] = { completed: 0, total: 0 };
        progressByDay[e.day_number].total++;
        if (e.completed) progressByDay[e.day_number].completed++;
    });

    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        const diffTime = d - start;
        const dayNum = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const dayData = progressByDay[dayNum] || { completed: 0, total: 0 };
        result.push({
            day: dayLabel,
            completed: dayData.completed,
            total: dayData.total,
            percentage: dayData.total > 0 ? Math.round((dayData.completed / dayData.total) * 100) : 0,
        });
    }
    return result;
};

/** Pure client-side: today's next incomplete task */
export const getTodayFocus = (entries, startDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const diffTime = today - start;
    const dayNumber = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (dayNumber < 1) return { message: "Your program hasn't started yet. Get ready!" };

    // Also check if day is locked
    if (isDayLocked(entries, dayNumber)) {
        return { message: "Your previous day's tasks are incomplete. Please finish them first to unlock today's focus.", isLocked: true };
    }

    const timeOrder = { morning: 1, afternoon: 2, evening: 3, night: 4 };
    const todayEntries = entries
        .filter((e) => e.day_number === dayNumber && !e.completed)
        .sort((a, b) => (timeOrder[a.time_of_day] || 9) - (timeOrder[b.time_of_day] || 9));

    if (todayEntries.length === 0)
        return { message: "You've completed all tasks for today! Great job.", allCompleted: true };

    return todayEntries[0];
};
