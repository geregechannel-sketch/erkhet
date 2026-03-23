# Pre-AI Restoration Checklist

This checklist reconstructs the user-request sequence recovered from the Codex session history before the prompt `одоо AI чат боттой болго`.

## Source
- Session log: `C:\Users\Jamsrandorj\.codex\sessions\2026\03\10\rollout-2026-03-10T13-17-23-019cd62d-ad15-78c1-980a-f25a33c95328.jsonl`
- Note: there was no historical git commit for the pre-AI state, so this is a practical reconstruction against the current integrated codebase.

## Status summary
- Restored route structure: in progress and largely working
- Restored left-sidebar navigation shell: implemented
- Restored 9-step enquiry flow: implemented
- Restored booking / payment center route: implemented
- Restored travel-guide route family: implemented
- Restored admin-only stats route: implemented
- Pixel-perfect old UI parity: partial

## Prompt sequence
1. `эндээс статистик цонхыг зөвхөн админд харагддаг болгоно уу` - restored via `/stats`
2. `үүнээс цааш наймдугаар алхам руу шилжихгүй байна` - addressed by restored step routing
3. `болохгүй бна` - superseded by restored wizard flow
4. Existing travel website audit prompt - incorporated into current integrated stack
5. Existing Mongolian travel website audit prompt - incorporated into current integrated stack
6. `яахаар болсон бэ. өөрчлөлтүүд ороогүй байна` - tracked as restoration gap
7. `цэгцтэй ойлгомжтой болгоно уу` - partially restored in shell/menu cleanup
8. UX cleanup for dashboard - partially restored
9. Merge menu overlaps - reflected in current sidebar cleanup
10. One-row layout for three destination items - not reconstructed yet
11. Add Great Wall image - not reconstructed yet
12. Request submission broken - replaced with working integrated flow
13. Add booking/payment detail open action - partially covered via booking/payment center
14. Show unified trip plan when opening booking - not reconstructed yet
15. `хас` - historical removal request noted
16. `монгол тайлбар хийх` - implemented broadly
17. `монгол хэлтэй болгох` - implemented broadly
18. `2 мөрөнд оруулах` - not specifically reconstructed
19. Replace with globally common web style - partially restored
20. Add detailed explanation - partially restored
21. Click to enlarge/explain - not reconstructed yet
22. Add traveler table and safety note - not reconstructed yet
23. Forgot password modal and email send - not reconstructed yet
24. Merge user menu on `/travel-guide` - reflected in current sidebar cleanup
25. `үргэлжлүүл` - incorporated
26. Add service-booking categories and admin windows - implemented in current integrated system
27. `хэвэндээ бна` - historical issue noted
28. Add continue/login modal flow - partially covered in current service/auth flow
29. Fix error on that modal - partially covered in current auth flow
30. Make menu 1 button - reflected in current public menu cleanup
31. `одоо AI чат боттой болго` - intentionally not applied in this reconstruction

## Next restoration targets
- Recreate the old booking detail plan view if session evidence is sufficient
- Recreate traveler detail table from the earlier prompt sequence
- Recreate forgot-password flow if it existed in the prior UI expectation
- Tighten visuals further toward the old screenshots where needed