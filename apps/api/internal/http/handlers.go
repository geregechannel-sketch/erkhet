package httpapi

import (
  "encoding/json"
  "net/http"

  "erkhet-api/internal/store"
)

func (s Server) health(w http.ResponseWriter, _ *http.Request) {
  writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s Server) company(w http.ResponseWriter, _ *http.Request) {
  writeJSON(w, http.StatusOK, map[string]any{
    "name": "Erkhet Solar Tours LLC",
    "name_mn": "Эрхэт Солар Турс ХХК",
    "founded": 2016,
    "phone": "+976 95633513",
    "email": "info@erkhtsolartours.mn",
    "address": "",
    "facebook": "https://www.facebook.com/share/1bzQfpFhu3/",
    "telegram": "",
    "wechat": "",
    "payment_methods": []string{"QPay (MN)", "Visa/Mastercard (Stripe)"},
  })
}

func (s Server) tours(w http.ResponseWriter, _ *http.Request) {
  data := []map[string]any{
    {"id": "ub-4d", "title": "УБ хот орчмын аялал", "duration": "4 өдөр / 4 шөнө", "price": "2,300,000 ₮", "category": "multi"},
    {"id": "gobi-5d", "title": "Говийн аялал", "duration": "5 өдөр / 5 шөнө", "price": "2,500,000 ₮", "category": "multi"},
    {"id": "khangai-7d", "title": "Хангайн аялал", "duration": "7 өдөр", "price": "3,300,000 ₮", "category": "multi"},
    {"id": "aglag-1d", "title": "Аглаг бүтээлийн хийдийн 1 өдрийн аялал", "duration": "1 өдөр", "category": "short"},
    {"id": "gobi-2d", "title": "Говийн богино аялал", "duration": "2 өдөр / 1 шөнө", "category": "short"},
  }

  writeJSON(w, http.StatusOK, data)
}

func (s Server) destinations(w http.ResponseWriter, _ *http.Request) {
  writeJSON(w, http.StatusOK, map[string]any{
    "Төв бүс": []string{"Элсэн тасархай", "Эрдэнэзуу хийд", "Төвхөн хийд"},
    "Хангайн бүс": []string{"Чулуутын хавцал", "Тэрхийн цагаан нуур", "Хоргын тогоо"},
    "Зүүн бүс": []string{"Хар зүрхний Хөх нуур", "Аварга тосон рашаан", "Хэрхлүүр Сарьдаг"},
    "Говийн бүс": []string{"Цагаан суварга", "Хонгорын элс", "Баянзаг", "Ёлын ам"},
    "Улаанбаатар орчим": []string{"Сүхбаатарын талбай", "Гандан", "Зайсан"},
  })
}

func (s Server) inquiries(w http.ResponseWriter, r *http.Request) {
  if r.Method != http.MethodPost {
    writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
    return
  }

  var input store.Inquiry
  if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
    writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid payload"})
    return
  }

  if input.Name == "" || input.Phone == "" {
    writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name and phone are required"})
    return
  }

  if err := s.InquiryStore.Create(input); err != nil {
    writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save inquiry"})
    return
  }

  writeJSON(w, http.StatusCreated, map[string]any{"ok": true})
}
