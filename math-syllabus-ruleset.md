# Math Problem Generation Rules for Primary 5 Students

Based on the curriculum images provided, generate math problems following these specifications:

## General Rules

1. **Target Level**: Primary 5 (approximately 10-11 years old)
2. **Language**: Clear, simple English with real-world contexts
3. **Difficulty**: Age-appropriate, challenging but achievable
4. **Calculator Use**: NO calculator allowed for specified topics
5. **Output Format**: JSON with `problem_text` and `final_answer` fields

## Content Areas & Rules

### 1. WHOLE NUMBERS

**Numbers up to 10 million (1.1)**
- Use numbers between 1,000 and 10,000,000
- Include word problems requiring reading/writing numerals
- Example contexts: population, distances, money amounts

**Four Operations (2.1-2.3)**
- Multiplication/division by 10, 100, 1000 and their multiples WITHOUT calculator
- Order of operations problems WITHOUT calculator (PEMDAS/BODMAS)
- Use brackets in expressions WITHOUT calculator
- Multi-step word problems combining operations
- Numbers should range from 2-digit to 6-digit values

### 2. FRACTIONS

**Fraction and Division (1.1-1.2)**
- Division problems with quotient expressed as fractions
- Converting fractions to decimals and vice versa
- Proper fractions, improper fractions, and mixed numbers

**Four Operations (2.1-2.5)**
- Adding/subtracting mixed numbers
- Multiplying proper/improper fractions by whole numbers WITHOUT calculator
- Multiplying proper fractions by proper/improper fractions WITHOUT calculator
- Multiplying two improper fractions
- Multiplying mixed numbers by whole numbers
- Real-world contexts: cooking, measurements, sharing

### 3. DECIMALS

**Four Operations (1.1-1.2)**
- Decimals up to 3 decimal places only
- Multiply/divide by 10, 100, 1000 and multiples WITHOUT calculator
- Unit conversions in decimal form:
  - Kilometres ↔ metres
  - Metres ↔ centimetres
  - Kilograms ↔ grams
  - Litres ↔ millilitres
- Real-world contexts: measurements, money, distances

### 4. PERCENTAGE

**Percentage Operations (1.1-1.4)**
- Expressing parts as percentages
- Using the % symbol correctly
- Finding percentage part of a whole
- Calculating discount, GST, and annual interest
- Real-world contexts: shopping, savings, sales

### 5. RATE

**Rate Concepts (1.1-1.2)**
- Rate as amount per unit (e.g., km/h, $/kg)
- Finding rate, total amount, or number of units given two quantities
- Real-world contexts: speed, unit pricing, work rates

### 6. AREA AND VOLUME

**Area of Triangle (1.1-1.3)**
- Base and height concepts
- Triangle area formula: A = ½ × base × height
- Composite figures with rectangles, squares, and triangles

**Volume of Cube and Cuboid (2.1-2.6)**
- Building with unit cubes
- Volume in cm³/m³ with conversions between cm³ and m³
- Drawing on isometric grid
- Volume formulas for cubes/cuboids
- Volume of liquid in rectangular tanks
- Relationship between ℓ (liters) and cm³

### 7. GEOMETRY

**Angles (1.1-1.4)**
- Angles on a straight line (180°)
- Angles at a point (360°)
- Vertically opposite angles
- Finding unknown angles from given information

**Triangles (2.1-2.3)**
- Properties of isosceles, equilateral, right-angled triangles
- Angle sum of triangle (180°)
- Finding unknown angles WITHOUT additional construction lines

**Quadrilaterals (3.1-3.2)**
- Properties of parallelograms, rhombus, trapezium
- Finding unknown angles WITHOUT additional construction lines

## Problem Generation Guidelines

### Difficulty Calibration
- **Easy**: Direct application of one concept
- **Medium**: Two-step problems or simple combinations
- **Hard**: Multi-step, requires planning, combines multiple concepts

### Context Requirements
- Use realistic, relatable scenarios (school, home, shopping, sports, nature)
- Include names common in diverse cultures
- Avoid culturally specific references that may confuse students

### Number Selection
- Whole numbers: Use "friendly" numbers that allow mental math practice
- Fractions: Start with unit fractions, then common fractions (halves, thirds, quarters, fifths)
- Decimals: Maximum 3 decimal places
- Avoid unnecessarily complex calculations

### Answer Format
- `final_answer` must be a single numeric value (integer or decimal)
- For fractions: provide decimal equivalent OR simplified fraction as string
- For angles: provide degree value only (without ° symbol in answer)
- For money: round to 2 decimal places
- For percentages: provide numeric value only (without % symbol in answer)

## JSON Output Format
```json
{
  "problem_text": "[Clear, concise problem statement with all necessary information. Include units where applicable.]",
  "final_answer": [numeric value or simplified fraction string]
}