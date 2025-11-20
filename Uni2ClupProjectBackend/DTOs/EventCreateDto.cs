using System;

namespace Uni2ClupProjectBackend.DTOs
{
    // Yeni etkinlik formundan gelecek veriyi taþýyan DTO
    public class EventCreateDto
    {
        // Etkinlik Ýsmi
        public string Name { get; set; } = string.Empty;

        // Yer Bilgisi
        public string Location { get; set; } = string.Empty;

        // Kontenjan (sadece sayý)
        public int Capacity { get; set; }

        // Etkinliðin açýklamasý (isteðe baðlý)
        public string Description { get; set; } = string.Empty;

        // Baþlangýç Tarihi
        public DateTime StartDate { get; set; }

        // Bitiþ Tarihi
        public DateTime EndDate { get; set; }
    }
}
