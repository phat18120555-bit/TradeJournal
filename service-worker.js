{
  "name": "Trade Journal — สมุดซื้อขาย",
  "short_name": "Trade Journal",
  "description": "สมุดบันทึกและวิเคราะห์การซื้อขายหุ้น คำนวณต้นทุนเฉลี่ยและกำไรขาดทุนอัตโนมัติ",
  "start_url": "./",
  "id": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#EDF0F2",
  "theme_color": "#0A5C74",
  "lang": "th",
  "icons": [
    {
      "src": "./icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "./icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "./icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "dir": "auto",
  "categories": [
    "finance",
    "business",
    "productivity"
  ],
  "launch_handler": {
    "client_mode": "focus-existing"
  },
  "shortcuts": [
    {
      "name": "ภาพรวมพอร์ต",
      "short_name": "ภาพรวม",
      "url": "./#sum",
      "description": "ดูมูลค่าพอร์ตและกำไรขาดทุนรวม",
      "icons": [
        {
          "src": "./icon-192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "เพิ่มรายการหุ้น",
      "short_name": "เพิ่มหุ้น",
      "url": "./#stock-add",
      "description": "บันทึกซื้อ/ขายหุ้นใหม่",
      "icons": [
        {
          "src": "./icon-192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "แลกเงิน บาท ↔ USD",
      "short_name": "แลกเงิน",
      "url": "./#fx",
      "description": "ดูและบันทึกการแลกเงิน",
      "icons": [
        {
          "src": "./icon-192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "ฝาก/ถอน",
      "short_name": "ฝาก/ถอน",
      "url": "./#cash",
      "description": "ดูและบันทึกฝาก-ถอนบัญชีเทรด",
      "icons": [
        {
          "src": "./icon-192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    }
  ]
}
