package httpapi

import (
  "encoding/json"
  "strings"
  "unicode"
  "unicode/utf8"
)

var cp1252ByteMap = map[rune]byte{
  0x20AC: 0x80,
  0x201A: 0x82,
  0x0192: 0x83,
  0x201E: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02C6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8A,
  0x2039: 0x8B,
  0x0152: 0x8C,
  0x017D: 0x8E,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201C: 0x93,
  0x201D: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02DC: 0x98,
  0x2122: 0x99,
  0x0161: 0x9A,
  0x203A: 0x9B,
  0x0153: 0x9C,
  0x017E: 0x9E,
  0x0178: 0x9F,
}

var suspiciousRunes = map[rune]struct{}{
  0x00C3: {},
  0x00D0: {},
  0x00D1: {},
  0x00C2: {},
  0x00E4: {},
  0x00EF: {},
  utf8.RuneError: {},
}

func sanitizeJSONPayload(payload any) any {
  bytes, err := json.Marshal(payload)
  if err != nil {
    return payload
  }

  var generic any
  if err := json.Unmarshal(bytes, &generic); err != nil {
    return payload
  }

  return sanitizeJSONValue(generic)
}

func sanitizeJSONValue(value any) any {
  switch typed := value.(type) {
  case string:
    return repairTextGo(typed)
  case []any:
    repaired := make([]any, len(typed))
    for index, item := range typed {
      repaired[index] = sanitizeJSONValue(item)
    }
    return repaired
  case map[string]any:
    repaired := make(map[string]any, len(typed))
    for key, item := range typed {
      repaired[key] = sanitizeJSONValue(item)
    }
    return repaired
  default:
    return value
  }
}

func repairTextGo(value string) string {
  if !containsSuspiciousRunes(value) {
    return value
  }

  best := value
  bestScore := scoreReadableTextGo(value)
  current := value

  for step := 0; step < 5; step++ {
    decoded := decodeUtf8MistGo(current)
    if decoded == "" || decoded == current {
      break
    }

    decodedScore := scoreReadableTextGo(decoded)
    if decodedScore > bestScore {
      best = decoded
      bestScore = decodedScore
    }
    current = decoded
  }

  return best
}

func containsSuspiciousRunes(value string) bool {
  for _, char := range value {
    if _, ok := suspiciousRunes[char]; ok {
      return true
    }
    if _, ok := cp1252ByteMap[char]; ok {
      return true
    }
  }

  return false
}

func scoreReadableTextGo(value string) int {
  score := 0
  hasCyrillic := false
  hasHan := false
  hasControl := false
  hasLatinWord := false
  latinRun := 0

  for _, char := range value {
    if unicode.Is(unicode.Cyrillic, char) {
      hasCyrillic = true
    }
    if unicode.Is(unicode.Han, char) {
      hasHan = true
    }
    if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') {
      latinRun++
      if latinRun >= 3 {
        hasLatinWord = true
      }
    } else {
      latinRun = 0
    }
    if (char >= 0 && char < 32) && char != '\n' && char != '\r' && char != '\t' {
      hasControl = true
    }
  }

  if hasCyrillic {
    score += 8
  }
  if hasHan {
    score += 8
  }
  if hasLatinWord {
    score += 2
  }
  if strings.ContainsAny(value, string([]rune{0x00C3, 0x00D0, 0x00D1, 0x00C2})) {
    score -= 8
  }
  if strings.ContainsRune(value, utf8.RuneError) || strings.Contains(value, "ï¿½") {
    score -= 12
  }
  if strings.Contains(value, "Ã‚Â°") || strings.Contains(value, "Â°") {
    score -= 4
  }
  if hasControl {
    score -= 8
  }

  return score
}

func decodeUtf8MistGo(value string) string {
  bytes := make([]byte, 0, len(value))

  for _, char := range value {
    next, ok := toLegacyByte(char)
    if !ok {
      return strings.TrimSpace(value)
    }
    bytes = append(bytes, next)
  }

  if !utf8.Valid(bytes) {
    return strings.TrimSpace(value)
  }

  return strings.TrimSpace(string(bytes))
}

func toLegacyByte(char rune) (byte, bool) {
  if mapped, ok := cp1252ByteMap[char]; ok {
    return mapped, true
  }
  if char <= 0xFF {
    return byte(char), true
  }
  return 0, false
}
