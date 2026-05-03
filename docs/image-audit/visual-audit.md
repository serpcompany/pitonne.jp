# Image Visual Audit

Generated: 2026-05-03T15:18:25Z

Fresh live route check: 17/17 manifest page/image pairs passed against `http://127.0.0.1:3000`.

| Page | Expected image | Rendered local path | Visual result | Action |
|---|---|---|---|---|
| / | Tokyotower-background.heic | /images/content/sheet/home.jpg | pass | none |
| /about/ | entranceï¼¿two.JPG | /images/content/sheet/about-clinic.jpg | pass | none |
| /services/ | Online Consultation_3_H.jpg | /images/content/sheet/services/services.jpg | pass | none |
| /services/iv-therapy/ | Hotel IV Drip_2_H.jpg | /images/content/sheet/services/iv-therapy.jpg | pass | none |
| /services/exosome-iv-drip/ | Exosome_H.jpg | /images/content/sheet/services/exosome-iv-drip.jpg | pass | none |
| /services/hangover-iv-drip/ | Hangover_H.jpg | /images/content/sheet/services/hangover-iv-drip.jpg | pass | none |
| /services/energy-fatigue-recovery-iv/ | Energy Recovery_H.jpg | /images/content/sheet/services/energy-fatigue-recovery-iv.jpg | pass | none |
| /services/immune-boost-iv-therapy/ | Immune Boost_H.jpg | /images/content/sheet/services/immune-boost-iv-therapy.jpg | pass | none |
| /services/skin-brightening-iv-drip/ | Skin Brightening_H.jpg | /images/content/sheet/services/skin-brightening-iv-drip.jpg | pass | none |
| /services/iv-vitamin-therapy/ | Vitamin Shot_H.jpg | /images/content/sheet/services/iv-vitamin-therapy.jpg | pass | none |
| /services/ed-medication/ | Cialis_2_H.jpg | /images/content/sheet/services/ed-medication.jpg | pass | none |
| /services/stem-cell-nasal-spray/ | Exosome Nasal Spray_H.jpg | /images/content/sheet/services/stem-cell-nasal-spray.jpg | pass | none |
| /services/stem-cell-therapy/ | Consultation Room_Akira_H.jpg | /images/content/sheet/services/stem-cell-therapy.jpg | pass | none |
| /blog/ | Consultation_Kana_H.jpg | /images/content/sheet/blog/blog.jpg | pass | none |
| /blog/iv-therapy-for-dehydration/ | Hotel IV Drip Close Up_2_V.jpg | /images/content/sheet/blog/iv-therapy-for-dehydration.jpg | pass | none |
| /blog/iv-therapy-for-fatigue/ | Online Consultation_3_H.jpg | /images/content/sheet/blog/iv-therapy-for-fatigue.jpg | pass | none |
| /blog/iv-therapy-for-hangover/ | Hangover_V.jpg | /images/content/sheet/blog/iv-therapy-for-hangover.jpg | pass | none |
| / | Hotel IV Drip_2_H card | /images/content/sheet/services/iv-therapy.jpg | pass | none |
| / | Consultation Room_Akira_H card | /images/content/sheet/services/stem-cell-therapy.jpg | pass | none |

## Blocked

- `/services/medication/`: Sheet image is an iStock webpage URL, not a licensed downloadable asset. Kept `/images/office_exam_room-scaled.jpg`.

## Unmapped

- blood Testing -> /images/content/sheet/unmapped/blood-testing.jpg
- AGA medication -> /images/content/sheet/unmapped/aga-medication.jpg
- stem cell therapy How It Works -> no current image URL in Sheet
- How Mobile IV Therapy Works -> no current image URL in Sheet
- How Online Prescription Works -> no current image URL in Sheet

## Stale Local Files

These files are present under `public/images/content/sheet/` but are not referenced by the current manifest. They were not deleted.

- `public/images/content/sheet/blog/blog.png`
- `public/images/content/sheet/services/medication.jpg`
- `public/images/content/sheet/unmapped/sheet-image-1034lUitn2AE75sBPxqFob9ZNF2ToR16t.jpg`
- `public/images/content/sheet/unmapped/sheet-image-1Fi7S5RELa6x0qiBoYpIvRChItC3IElRt.jpg`
- `public/images/content/sheet/unmapped/sheet-image-1PHahYJgKhnTz9Hkv-OtGIMkvvVHhaT8d.jpg`
- `public/images/content/sheet/unmapped/sheet-image-1f9X0aCfNKcm8uP506yCL16tsz03jvfSt.jpg`
- `public/images/content/sheet/unmapped/stem-cell-therapy-how-it-works.jpg`
