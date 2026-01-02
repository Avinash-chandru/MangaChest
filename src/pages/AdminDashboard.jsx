import { useState, useEffect } from 'react';
import { mangaData } from '../data/mangaData';


function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    type: 'manga',
    description: ''
  });

  // Upload chapter modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    mangaId: mangaData[0]?.id || '',
    chapterNumber: '',
    title: '',
    file: null
  });



  // Stats (totalUsers will be synced from Firestore users collection)
  let stats = {
    totalManga: mangaData.length,
    totalUsers: 0,
    totalChapters: mangaData.reduce((sum, manga) => sum + manga.chapters.length, 0),
    totalViews: '15.2M',
    newUsersToday: 45,
    activeReaders: 0
  };

  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsersToday, setNewUsersToday] = useState(0);
  const [usersLastUpdated, setUsersLastUpdated] = useState(null);



  // Live manga list (local only)
  const [liveManga, setLiveManga] = useState(mangaData);

  // Users metrics removed (Firebase was removed). Defaults retained.
  useEffect(() => {
    // No-op: users/real-time metrics disabled
    return () => {};
  }, []);

  // One-time users count removed (Firebase was removed). No-op.

  // Keep dashboard stats in sync with live users
  stats.totalUsers = totalUsers;
  stats.newUsersToday = newUsersToday;

  


  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddManga = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      author: formData.author,
      genre: formData.genre,
      type: formData.type,
      description: formData.description,
      coverImage: formData.coverImage || '',
      bannerImage: formData.bannerImage || '',
      rating: formData.rating || 0,
      status: formData.status || 'Ongoing'
    };

    try {
      if (formData.id) {
        // Local edit
        const id = formData.id;
        setLiveManga((prev) => prev.map((m) => (m.id === id ? { ...m, ...payload } : m)));
        alert('Manga updated (local only)');
      } else {
        // Local add
        const newItem = { ...payload, id: Date.now().toString(), chapters: [] };
        setLiveManga((prev) => [newItem, ...prev]);
        alert('Manga added (local only)');
      }
    } catch (err) {
      console.error(err);
      alert('Operation failed: ' + err.message);
    }

    setShowAddModal(false);
    setFormData({
      title: '',
      author: '',
      genre: '',
      type: 'manga',
      description: ''
    });
  };

  // Upload chapter handlers (demo-only)
  const handleUploadChange = (e) => {
    setUploadData({ ...uploadData, [e.target.name]: e.target.value });
  };

  const handleUploadFileChange = (e) => {
    setUploadData({ ...uploadData, file: e.target.files[0] });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      // Local-only: append chapter to selected manga in local state
      const chapterPayload = {
        id: Date.now().toString(),
        chapterNumber: uploadData.chapterNumber,
        title: uploadData.title,
        uploadedAt: new Date().toISOString(),
        fileName: uploadData.file?.name || null
      };

      setLiveManga((prev) => prev.map((m) => m.id === uploadData.mangaId ? { ...m, chapters: [...(m.chapters || []), chapterPayload] } : m));
      alert('Chapter uploaded (local only)');
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    }

    setShowUploadModal(false);
    setUploadData({ mangaId: mangaData[0]?.id || '', chapterNumber: '', title: '', file: null });
  };

  const handleEditClick = (manga) => {
    setFormData({
      id: manga.id,
      title: manga.title || '',
      author: manga.author || '',
      genre: manga.genre || '',
      type: manga.type || 'manga',
      description: manga.description || '',
      coverImage: manga.coverImage || '',
      bannerImage: manga.bannerImage || '',
      rating: manga.rating || 0,
      status: manga.status || 'Ongoing'
    });
    setShowAddModal(true);
  };

  const handleDeleteManga = async (mangaId) => {
    if (!confirm('Delete this manga? This action cannot be undone.')) return;

    // Optimistic UI (local only)
    setLiveManga((prev) => prev.filter((m) => m.id !== mangaId));

    try {
      // Note: deletion is local only since Firebase is removed
      alert('Manga deleted (local only)');
    } catch (err) {
      console.error(err);
      alert('Delete failed: ' + err.message);
      // Revert UI (best-effort)
      setLiveManga(mangaData);
    }
  }; 



  return (
    <div className="admin-dashboard bg-dark min-vh-100 text-white">
      <div className="admin-header bg-warning text-dark py-4">
        <div className="container">
          <div className="d-flex align-items-center">
            <h1 className="mb-0">
              <i className="bi bi-shield-lock me-2"></i>
              Admin Dashboard
            </h1>
            <span className="badge bg-light text-dark ms-3" style={{ fontSize: '0.8rem' }}>
              LOCAL
            </span>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card bg-gradient border-0 h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1">Total Manga</h6>
                    <h2 className="mb-0">{stats.totalManga}</h2>
                  </div>
                  <i className="bi bi-book fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>


          <div className="col-md-6">
            <div className="card bg-gradient border-0 h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 mb-1">Total Chapters</h6>
                    <h2 className="mb-0">{stats.totalChapters}</h2>
                  </div>
                  <i className="bi bi-journals fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>


        </div>

        

        <div className="card bg-dark-subtle border-0 mb-4">
          <div className="card-header bg-transparent border-0">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'manga' ? 'active' : ''}`}
                  onClick={() => setActiveTab('manga')}
                >
                  Manage Manga
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                >
                  Statistics
                </button>
              </li>  
            </ul>
          </div>

          <div className="card-body">
            {activeTab === 'overview' && (
              <div>
                <h4 className="mb-4">Platform Overview</h4>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card bg-dark border-0">
                      <div className="card-body">
                        <h5 className="mb-3">Recent Activity</h5>
                        <ul className="list-unstyled">
                          <li className="mb-2">
                            <i className="bi bi-circle-fill text-secondary me-2" style={{ fontSize: '8px' }}></i>
                            Live users disabled (Firebase removed)
                          </li> 
                          <li className="mb-2">
                            <i className="bi bi-circle-fill text-info me-2" style={{ fontSize: '8px' }}></i>
                            {stats.newUsersToday} new users registered today
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-circle-fill text-warning me-2" style={{ fontSize: '8px' }}></i>
                            5 new chapters uploaded today
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-dark border-0">
                      <div className="card-body">
                        <h5 className="mb-3">Quick Actions</h5>
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-warning"
                            onClick={() => setActiveTab('manga')}
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Add New Manga
                          </button>
                          <button className="btn btn-outline-light" onClick={() => setShowUploadModal(true)}>
                            <i className="bi bi-file-earmark-arrow-up me-2"></i>
                            Upload Chapter
                          </button>
                          <button className="btn btn-outline-light" onClick={() => setActiveTab('stats')}>
                            <i className="bi bi-graph-up me-2"></i>
                            View Reports
                          </button>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manga' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">Manage Manga</h4>
                  <button
                    className="btn btn-warning"
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add New Manga
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-dark table-hover">
                    <thead>
                      <tr>
                        <th>Cover</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Chapters</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveManga.map((manga) => (
                        <tr key={manga.id}>
                          <td>
                            <img
                              src={manga.coverImage}
                              alt={manga.title}
                              style={{ width: '50px', height: '70px', objectFit: 'cover' }}
                              className="rounded"
                            />
                          </td>
                          <td>{manga.title}</td>
                          <td>{manga.author}</td>
                          <td>{manga.chapters?.length || 0}</td>
                          <td>
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            {manga.rating}
                          </td>
                          <td>
                            <span className={`badge ${manga.status === 'Completed' ? 'bg-success' : 'bg-primary'}`}>
                              {manga.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEditClick(manga)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteManga(manga.id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}



            {activeTab === 'stats' && (
              <div>
                <h4 className="mb-4">Reading Statistics</h4>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card bg-dark border-0">
                      <div className="card-body">
                        <h5 className="mb-3">Most Popular Manga</h5>
                        <ol className="list-group list-group-numbered list-group-flush">
                          {mangaData.slice(0, 5).map((manga) => (
                            <li key={manga.id} className="list-group-item bg-transparent text-white border-secondary">
                              {manga.title}
                              <span className="badge bg-danger float-end">{manga.views}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-dark border-0">
                      <div className="card-body">
                        <h5 className="mb-3">Top Rated Manga</h5>
                        <ol className="list-group list-group-numbered list-group-flush">
                          {[...mangaData]
                            .sort((a, b) => b.rating - a.rating)
                            .slice(0, 5)
                            .map((manga) => (
                              <li key={manga.id} className="list-group-item bg-transparent text-white border-secondary">
                                {manga.title}
                                <span className="badge bg-warning text-dark float-end">
                                  <i className="bi bi-star-fill"></i> {manga.rating}
                                </span>
                              </li>
                            ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users tab removed — Firebase integration disabled. */}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark-subtle text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{formData.id ? 'Edit Manga' : 'Add New Manga'}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => { setShowAddModal(false); setFormData({ title: '', author: '', genre: '', type: 'manga', description: '' }); }}
                ></button>
              </div>
              <form onSubmit={handleAddManga}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Author</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Genre</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      placeholder="Action, Romance, etc."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="manga">Manga</option>
                      <option value="webtoon">Webtoon</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning">
                    {formData.id ? 'Save Changes' : 'Add Manga'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark-subtle text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Upload Chapter</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowUploadModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUploadSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Select Manga</label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      name="mangaId"
                      value={uploadData.mangaId}
                      onChange={handleUploadChange}
                    >
                      {mangaData.map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Chapter Number</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      name="chapterNumber"
                      value={uploadData.chapterNumber}
                      onChange={handleUploadChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      name="title"
                      value={uploadData.title}
                      onChange={handleUploadChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Upload File</label>
                    <input
                      type="file"
                      className="form-control bg-dark text-white border-secondary"
                      onChange={handleUploadFileChange}
                    />
                    <small className="text-muted">File upload is demo-only and will not be saved.</small>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning">
                    Upload Chapter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
