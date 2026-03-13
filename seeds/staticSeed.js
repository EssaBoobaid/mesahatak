const City = require('../models/City');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

const citySeedData = [
  { name: 'الرياض' },
  { name: 'جدة' },
  { name: 'مكة المكرمة' },
  { name: 'المدينة المنورة' },
  { name: 'الدمام' },
  { name: 'الخبر' },
  { name: 'الظهران' },
  { name: 'الطائف' },
  { name: 'تبوك' },
  { name: 'حائل' },
  { name: 'أبها' },
  { name: 'خميس مشيط' },
  { name: 'جازان' },
  { name: 'نجران' },
  { name: 'الباحة' },
  { name: 'عرعر' },
  { name: 'سكاكا' },
  { name: 'بيشة' },
  { name: 'ينبع' },
  { name: 'القريات' },
  { name: 'الأحساء' }
];

async function seedStaticData() {
  // Seed cities if empty
  const citiesCount = await City.count();
  if (citiesCount === 0) {
    await City.bulkCreate(citySeedData);
    console.log('Seeded cities table');
  }

  const categoriesCount = await Category.count();
  if (categoriesCount === 0) {
    const categories = [
      { code: 'residential', name_ar: 'سكني', name_en: 'Residential' },
      { code: 'commercial', name_ar: 'تجاري', name_en: 'Commercial' },
      { code: 'sports', name_ar: 'رياضي وترفيهي', name_en: 'Sports & Leisure' },
      { code: 'storage', name_ar: 'مستودعات ولوجستيات', name_en: 'Storage & Logistics' },
      { code: 'events', name_ar: 'مناسبات وفعاليات', name_en: 'Events' },
      { code: 'parking', name_ar: 'مواقف ومركبات', name_en: 'Parking' },
      { code: 'industrial', name_ar: 'صناعي', name_en: 'Industrial' },
      { code: 'outdoor', name_ar: 'خارجي / مفتوح', name_en: 'Outdoor' },
      { code: 'other', name_ar: 'أخرى', name_en: 'Other' }
    ];
    const created = await Category.bulkCreate(categories, { returning: true });

    const byCode = Object.fromEntries(created.map(c => [c.code, c.id]));

    const subcategories = [
      // Residential
      ['residential', 'شقة', 'Apartment'],
      ['residential', 'فيلا', 'Villa'],
      ['residential', 'غرفة', 'Room'],
      ['residential', 'استديو', 'Studio'],
      ['residential', 'سكن عمال', 'Labor Housing'],
      ['residential', 'شاليه', 'Chalet'],
      ['residential', 'مزرعة سكنية', 'Residential Farm'],
      // Commercial
      ['commercial', 'مكتب', 'Office'],
      ['commercial', 'محل', 'Shop'],
      ['commercial', 'معرض', 'Showroom'],
      ['commercial', 'كشك', 'Kiosk'],
      ['commercial', 'مركز أعمال', 'Business Center'],
      ['commercial', 'مساحة عمل مشتركة', 'Coworking Space'],
      // Sports
      ['sports', 'ملعب كرة قدم', 'Football Field'],
      ['sports', 'ملعب كرة سلة', 'Basketball Court'],
      ['sports', 'ملعب تنس', 'Tennis Court'],
      ['sports', 'صالة رياضية', 'Gym'],
      ['sports', 'مسبح', 'Pool'],
      ['sports', 'صالة ألعاب', 'Arcade'],
      ['sports', 'استراحة', 'Rest Area'],
      // Storage
      ['storage', 'مستودع مغلق', 'Closed Warehouse'],
      ['storage', 'مستودع مفتوح', 'Open Warehouse'],
      ['storage', 'مخزن تبريد', 'Cold Storage'],
      ['storage', 'هنقر', 'Hangar'],
      ['storage', 'ساحة تخزين', 'Storage Yard'],
      // Events
      ['events', 'قاعة أفراح', 'Wedding Hall'],
      ['events', 'قاعة اجتماعات', 'Meeting Room'],
      ['events', 'قاعة مؤتمرات', 'Conference Hall'],
      ['events', 'مسرح', 'Theater'],
      ['events', 'مساحة تصوير', 'Studio'],
      ['events', 'قاعة تدريب', 'Training Room'],
      // Parking
      ['parking', 'موقف سيارة', 'Car Parking'],
      ['parking', 'موقف دراجات', 'Bike Parking'],
      ['parking', 'كراج خاص', 'Private Garage'],
      ['parking', 'موقف شاحنات', 'Truck Parking'],
      // Industrial
      ['industrial', 'مصنع صغير', 'Small Factory'],
      ['industrial', 'ورشة', 'Workshop'],
      ['industrial', 'ورشة سيارات', 'Auto Workshop'],
      ['industrial', 'خط إنتاج', 'Production Line'],
      // Outdoor
      ['outdoor', 'أرض فضاء', 'Vacant Land'],
      ['outdoor', 'حديقة', 'Garden'],
      ['outdoor', 'مخيم', 'Camp'],
      ['outdoor', 'ساحة مفتوحة', 'Open Yard'],
      ['outdoor', 'أرض زراعية', 'Farmland']
    ].map(([code, name_ar, name_en]) => ({
      category_id: byCode[code],
      value: name_ar,
      name_ar,
      name_en
    }));

    await Subcategory.bulkCreate(subcategories);
    console.log('Seeded categories and subcategories tables');
  }
}

module.exports = { seedStaticData };
